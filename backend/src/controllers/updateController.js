const Update = require('../models/Update');
const Competitor = require('../models/Competitor');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/AppError');
const { paginate, getPaginationMeta } = require('../utils/helpers');
const scraperService = require('../services/scraperService');
const classificationService = require('../services/classificationService');
const alertService = require('../services/alertService');
const logger = require('../utils/logger');

/**
 * @desc    Get all updates
 * @route   GET /api/v1/updates
 * @access  Private
 */
exports.getUpdates = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    companyId,
    category,
    sentiment,
    search,
    sortBy = 'detectedAt',
    sortOrder = 'desc'
  } = req.query;

  const { skip, limit: parsedLimit, page: parsedPage } = paginate(page, limit);

  // Build query
  const query = {};
  if (companyId) query.companyId = companyId;
  if (category) query.category = category;
  if (sentiment) query.sentiment = sentiment;
  if (search) {
    query.$text = { $search: search };
  }

  // Sort
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Get updates
  const updates = await Update.find(query)
    .populate('companyId', 'name baseUrl')
    .sort(sortOptions)
    .skip(skip)
    .limit(parsedLimit);

  const total = await Update.countDocuments(query);

  res.status(200).json({
    success: true,
    data: updates,
    pagination: getPaginationMeta(total, parsedPage, parsedLimit)
  });
});

/**
 * @desc    Get single update
 * @route   GET /api/v1/updates/:id
 * @access  Private
 */
exports.getUpdate = asyncHandler(async (req, res, next) => {
  const update = await Update.findById(req.params.id)
    .populate('companyId', 'name baseUrl industry');

  if (!update) {
    return next(new AppError('Update not found', 404));
  }

  res.status(200).json({
    success: true,
    data: update
  });
});

/**
 * @desc    Manually trigger scraping for a competitor
 * @route   POST /api/v1/updates/refresh
 * @access  Private (Admin)
 */
exports.refreshUpdates = asyncHandler(async (req, res, next) => {
  const { competitorId } = req.body;

  if (!competitorId) {
    return next(new AppError('Competitor ID is required', 400));
  }

  const competitor = await Competitor.findById(competitorId);

  if (!competitor) {
    return next(new AppError('Competitor not found', 404));
  }

  logger.info(`Manual scrape initiated for: ${competitor.name}`);

  // Scrape all targets
  const newUpdates = [];

  for (const target of competitor.scrapeTargets) {
    try {
      const scrapedData = await scraperService.scrapeTarget(target, competitor.baseUrl);

      if (Array.isArray(scrapedData)) {
        for (const item of scrapedData) {
          // Check if update already exists
          const exists = await Update.findOne({ url: item.url });
          if (exists) continue;

          // Classify the update
          const classification = await classificationService.classifyUpdate(
            item.title || '',
            item.summary || '',
            item.content || ''
          );

          // Create update
          const update = await Update.create({
            companyId: competitor._id,
            title: item.title,
            summary: item.summary,
            content: item.content,
            url: item.url,
            sourceType: target.type,
            ...classification,
            detectedAt: item.date || new Date()
          });

          newUpdates.push(update);

          // Process alerts
          await alertService.processUpdate(update);
        }
      }
    } catch (error) {
      logger.error(`Scrape failed for ${target.url}: ${error.message}`);
    }
  }

  // Update last scraped time
  competitor.lastScrapedAt = new Date();
  await competitor.save();

  res.status(200).json({
    success: true,
    message: `Found ${newUpdates.length} new updates`,
    data: newUpdates
  });
});

/**
 * @desc    Get updates timeline
 * @route   GET /api/v1/updates/timeline
 * @access  Private
 */
exports.getTimeline = asyncHandler(async (req, res, next) => {
  const { days = 30, companyId } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const match = { detectedAt: { $gte: startDate } };
  if (companyId) match.companyId = companyId;

  const timeline = await Update.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$detectedAt' } },
          category: '$category'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: timeline
  });
});

/**
 * @desc    Delete update
 * @route   DELETE /api/v1/updates/:id
 * @access  Private (Admin)
 */
exports.deleteUpdate = asyncHandler(async (req, res, next) => {
  const update = await Update.findById(req.params.id);

  if (!update) {
    return next(new AppError('Update not found', 404));
  }

  await update.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
