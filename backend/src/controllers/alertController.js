const Alert = require('../models/Alert');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/AppError');
const { paginate, getPaginationMeta } = require('../utils/helpers');

/**
 * @desc    Get all alerts
 * @route   GET /api/v1/alerts
 * @access  Private
 */
exports.getAlerts = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    read,
    severity,
    companyId
  } = req.query;

  const { skip, limit: parsedLimit, page: parsedPage } = paginate(page, limit);

  // Build query
  const query = {};
  if (read !== undefined) query.read = read === 'true';
  if (severity) query.severity = severity;
  if (companyId) query.companyId = companyId;

  // Get alerts
  const alerts = await Alert.find(query)
    .populate('companyId', 'name')
    .populate('updateId', 'title url category')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit);

  const total = await Alert.countDocuments(query);

  res.status(200).json({
    success: true,
    data: alerts,
    pagination: getPaginationMeta(total, parsedPage, parsedLimit)
  });
});

/**
 * @desc    Get single alert
 * @route   GET /api/v1/alerts/:id
 * @access  Private
 */
exports.getAlert = asyncHandler(async (req, res, next) => {
  const alert = await Alert.findById(req.params.id)
    .populate('companyId')
    .populate('updateId');

  if (!alert) {
    return next(new AppError('Alert not found', 404));
  }

  res.status(200).json({
    success: true,
    data: alert
  });
});

/**
 * @desc    Mark alert as read
 * @route   PUT /api/v1/alerts/:id/read
 * @access  Private
 */
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const alert = await Alert.findByIdAndUpdate(
    req.params.id,
    { read: true, readAt: new Date() },
    { new: true }
  );

  if (!alert) {
    return next(new AppError('Alert not found', 404));
  }

  res.status(200).json({
    success: true,
    data: alert
  });
});

/**
 * @desc    Mark all alerts as read
 * @route   PUT /api/v1/alerts/read-all
 * @access  Private
 */
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Alert.updateMany(
    { read: false },
    { read: true, readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    message: 'All alerts marked as read'
  });
});

/**
 * @desc    Delete alert
 * @route   DELETE /api/v1/alerts/:id
 * @access  Private
 */
exports.deleteAlert = asyncHandler(async (req, res, next) => {
  const alert = await Alert.findById(req.params.id);

  if (!alert) {
    return next(new AppError('Alert not found', 404));
  }

  await alert.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
