const Update = require('../models/Update');
const Alert = require('../models/Alert');
const Competitor = require('../models/Competitor');
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * @desc    Get dashboard overview
 * @route   GET /api/v1/analytics/overview
 * @access  Private
 */
exports.getOverview = asyncHandler(async (req, res, next) => {
  const { days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  // Total updates
  const totalUpdates = await Update.countDocuments({
    detectedAt: { $gte: startDate }
  });

  // Total alerts
  const totalAlerts = await Alert.countDocuments({
    createdAt: { $gte: startDate }
  });

  // Unread alerts
  const unreadAlerts = await Alert.countDocuments({ read: false });

  // Active competitors
  const activeCompetitors = await Competitor.countDocuments({ active: true });

  // Updates by category
  const categoryBreakdown = await Update.aggregate([
    { $match: { detectedAt: { $gte: startDate } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Average sentiment
  const sentimentStats = await Update.aggregate([
    { $match: { detectedAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        avgSentiment: { $avg: '$sentimentScore' },
        avgImpact: { $avg: '$impactScore' }
      }
    }
  ]);

  // Top competitors by activity
  const topCompetitors = await Update.aggregate([
    { $match: { detectedAt: { $gte: startDate } } },
    { $group: { _id: '$companyId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'competitors',
        localField: '_id',
        foreignField: '_id',
        as: 'competitor'
      }
    },
    { $unwind: '$competitor' },
    {
      $project: {
        name: '$competitor.name',
        count: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUpdates,
      totalAlerts,
      unreadAlerts,
      activeCompetitors,
      categoryBreakdown,
      averageSentiment: sentimentStats[0]?.avgSentiment || 0,
      averageImpact: sentimentStats[0]?.avgImpact || 5,
      topCompetitors
    }
  });
});

/**
 * @desc    Get category distribution
 * @route   GET /api/v1/analytics/categories
 * @access  Private
 */
exports.getCategoryStats = asyncHandler(async (req, res, next) => {
  const { days = 30, companyId } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const match = { detectedAt: { $gte: startDate } };
  if (companyId) match.companyId = companyId;

  const stats = await Update.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgImpact: { $avg: '$impactScore' },
        avgSentiment: { $avg: '$sentimentScore' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * @desc    Detect spikes in activity
 * @route   GET /api/v1/analytics/spikes
 * @access  Private
 */
exports.detectSpikes = asyncHandler(async (req, res, next) => {
  const competitors = await Competitor.find({ active: true });
  const spikes = [];

  for (const competitor of competitors) {
    // Get updates for last 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await Update.countDocuments({
      companyId: competitor._id,
      detectedAt: { $gte: last24h }
    });

    // Get average for last 30 days
    const last30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const totalCount = await Update.countDocuments({
      companyId: competitor._id,
      detectedAt: { $gte: last30d }
    });

    const avgPerDay = totalCount / 30;

    // If recent activity is significantly higher
    if (recentCount > avgPerDay * 2 && recentCount >= 3) {
      spikes.push({
        competitor: competitor.name,
        competitorId: competitor._id,
        recentCount,
        averageCount: avgPerDay,
        percentageIncrease: ((recentCount - avgPerDay) / avgPerDay) * 100
      });
    }
  }

  res.status(200).json({
    success: true,
    data: spikes
  });
});

/**
 * @desc    Get timeline data
 * @route   GET /api/v1/analytics/timeline
 * @access  Private
 */
exports.getTimeline = asyncHandler(async (req, res, next) => {
  const { days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const timeline = await Update.aggregate([
    { $match: { detectedAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$detectedAt' } },
        count: { $sum: 1 },
        avgImpact: { $avg: '$impactScore' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: timeline
  });
});
