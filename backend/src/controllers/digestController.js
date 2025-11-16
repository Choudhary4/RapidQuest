const digestService = require('../services/digestService');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * @desc    Get latest daily digest
 * @route   GET /api/v1/digest/daily/latest
 * @access  Private
 */
exports.getLatestDailyDigest = asyncHandler(async (req, res, next) => {
  const digest = await digestService.getLatestDigest('daily');

  if (!digest) {
    return next(new AppError('No daily digest available yet', 404));
  }

  res.status(200).json({
    success: true,
    data: digest
  });
});

/**
 * @desc    Get latest weekly digest
 * @route   GET /api/v1/digest/weekly/latest
 * @access  Private
 */
exports.getLatestWeeklyDigest = asyncHandler(async (req, res, next) => {
  const digest = await digestService.getLatestDigest('weekly');

  if (!digest) {
    return next(new AppError('No weekly digest available yet', 404));
  }

  res.status(200).json({
    success: true,
    data: digest
  });
});

/**
 * @desc    Generate daily digest manually
 * @route   POST /api/v1/digest/daily/generate
 * @access  Private (Admin)
 */
exports.generateDailyDigest = asyncHandler(async (req, res, next) => {
  logger.info(`Manual daily digest generation requested by ${req.user.email}`);

  const digest = await digestService.generateDailyDigest();

  if (!digest) {
    return res.status(200).json({
      success: true,
      message: 'No updates available to generate digest'
    });
  }

  res.status(201).json({
    success: true,
    data: digest,
    message: 'Daily digest generated successfully'
  });
});

/**
 * @desc    Generate weekly digest manually
 * @route   POST /api/v1/digest/weekly/generate
 * @access  Private (Admin)
 */
exports.generateWeeklyDigest = asyncHandler(async (req, res, next) => {
  logger.info(`Manual weekly digest generation requested by ${req.user.email}`);

  const digest = await digestService.generateWeeklyDigest();

  if (!digest) {
    return res.status(200).json({
      success: true,
      message: 'No updates available to generate digest'
    });
  }

  res.status(201).json({
    success: true,
    data: digest,
    message: 'Weekly digest generated successfully'
  });
});

/**
 * @desc    Get digest history
 * @route   GET /api/v1/digest/history
 * @access  Private
 */
exports.getDigestHistory = asyncHandler(async (req, res, next) => {
  const { type, limit = 30 } = req.query;

  const digests = await digestService.getDigestHistory(
    type,
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    count: digests.length,
    data: digests
  });
});
