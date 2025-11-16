const comparisonService = require('../services/comparisonService');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * @desc    Get latest comparison matrix
 * @route   GET /api/v1/comparison/latest
 * @access  Private
 */
exports.getLatestMatrix = asyncHandler(async (req, res, next) => {
  const matrix = await comparisonService.getLatestMatrix();

  if (!matrix) {
    return next(new AppError('No comparison matrix available yet', 404));
  }

  res.status(200).json({
    success: true,
    data: matrix
  });
});

/**
 * @desc    Generate comparison matrix manually
 * @route   POST /api/v1/comparison/generate
 * @access  Private (Admin)
 */
exports.generateMatrix = asyncHandler(async (req, res, next) => {
  logger.info(`Manual comparison matrix generation requested by ${req.user.email}`);

  const matrix = await comparisonService.generateComparisonMatrix();

  if (!matrix) {
    return res.status(200).json({
      success: true,
      message: 'Need at least 2 competitors to generate comparison matrix'
    });
  }

  res.status(201).json({
    success: true,
    data: matrix,
    message: 'Comparison matrix generated successfully'
  });
});

/**
 * @desc    Get comparison matrix history
 * @route   GET /api/v1/comparison/history
 * @access  Private
 */
exports.getMatrixHistory = asyncHandler(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const matrices = await comparisonService.getMatrixHistory(parseInt(limit));

  res.status(200).json({
    success: true,
    count: matrices.length,
    data: matrices
  });
});
