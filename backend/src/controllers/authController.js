const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/AppError');
const { generateToken } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * @desc    Register user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Create user - all users are admin by default
  const user = await User.create({
    name,
    email,
    password,
    role: 'admin'
  });

  logger.info(`User registered: ${email} (role: admin)`);

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Check if account is active
  if (!user.active) {
    return next(new AppError('Account is deactivated', 403));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  logger.info(`User logged in: ${email}`);

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  });
});

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, preferences } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, preferences },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: user
  });
});
