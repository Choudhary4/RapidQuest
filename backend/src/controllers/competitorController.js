const Competitor = require('../models/Competitor');
const Update = require('../models/Update');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/AppError');
const { paginate, getPaginationMeta } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * @desc    Get all competitors
 * @route   GET /api/v1/competitors
 * @access  Private
 */
exports.getCompetitors = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, active, search } = req.query;
  const { skip, limit: parsedLimit, page: parsedPage } = paginate(page, limit);

  // Build query
  const query = {};
  if (active !== undefined) {
    query.active = active === 'true';
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { industry: { $regex: search, $options: 'i' } }
    ];
  }

  // Get competitors
  const competitors = await Competitor.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit);

  const total = await Competitor.countDocuments(query);

  res.status(200).json({
    success: true,
    data: competitors,
    pagination: getPaginationMeta(total, parsedPage, parsedLimit)
  });
});

/**
 * @desc    Get single competitor
 * @route   GET /api/v1/competitors/:id
 * @access  Private
 */
exports.getCompetitor = asyncHandler(async (req, res, next) => {
  const competitor = await Competitor.findById(req.params.id);

  if (!competitor) {
    return next(new AppError('Competitor not found', 404));
  }

  // Get recent updates count
  const updatesCount = await Update.countDocuments({ companyId: competitor._id });

  res.status(200).json({
    success: true,
    data: {
      ...competitor.toObject(),
      updatesCount
    }
  });
});

/**
 * @desc    Create competitor
 * @route   POST /api/v1/competitors
 * @access  Private (Admin)
 */
exports.createCompetitor = asyncHandler(async (req, res, next) => {
  const competitor = await Competitor.create(req.body);

  logger.info(`Competitor created: ${competitor.name}`);

  res.status(201).json({
    success: true,
    data: competitor
  });
});

/**
 * @desc    Update competitor
 * @route   PUT /api/v1/competitors/:id
 * @access  Private (Admin)
 */
exports.updateCompetitor = asyncHandler(async (req, res, next) => {
  let competitor = await Competitor.findById(req.params.id);

  if (!competitor) {
    return next(new AppError('Competitor not found', 404));
  }

  competitor = await Competitor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  logger.info(`Competitor updated: ${competitor.name}`);

  res.status(200).json({
    success: true,
    data: competitor
  });
});

/**
 * @desc    Delete competitor
 * @route   DELETE /api/v1/competitors/:id
 * @access  Private (Admin)
 */
exports.deleteCompetitor = asyncHandler(async (req, res, next) => {
  const competitor = await Competitor.findById(req.params.id);

  if (!competitor) {
    return next(new AppError('Competitor not found', 404));
  }

  await competitor.deleteOne();

  // Delete associated updates
  await Update.deleteMany({ companyId: req.params.id });

  logger.info(`Competitor deleted: ${competitor.name}`);

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get competitor statistics
 * @route   GET /api/v1/competitors/:id/stats
 * @access  Private
 */
exports.getCompetitorStats = asyncHandler(async (req, res, next) => {
  const competitor = await Competitor.findById(req.params.id);

  if (!competitor) {
    return next(new AppError('Competitor not found', 404));
  }

  // Get updates by category
  const categoryStats = await Update.aggregate([
    { $match: { companyId: competitor._id } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get recent activity (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentUpdates = await Update.countDocuments({
    companyId: competitor._id,
    detectedAt: { $gte: thirtyDaysAgo }
  });

  // Get average sentiment
  const sentimentStats = await Update.aggregate([
    { $match: { companyId: competitor._id } },
    {
      $group: {
        _id: null,
        avgSentiment: { $avg: '$sentimentScore' },
        avgImpact: { $avg: '$impactScore' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      competitor: competitor.name,
      totalUpdates: await Update.countDocuments({ companyId: competitor._id }),
      recentUpdates,
      categoryBreakdown: categoryStats,
      averageSentiment: sentimentStats[0]?.avgSentiment || 0,
      averageImpact: sentimentStats[0]?.avgImpact || 5
    }
  });
});
