const express = require('express');
const router = express.Router();
const {
  getLatestDailyDigest,
  getLatestWeeklyDigest,
  generateDailyDigest,
  generateWeeklyDigest,
  getDigestHistory
} = require('../controllers/digestController');
const { protect, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// Public routes (all authenticated users)
router.get('/daily/latest', getLatestDailyDigest);
router.get('/weekly/latest', getLatestWeeklyDigest);
router.get('/history', getDigestHistory);

// Admin-only routes
router.post('/daily/generate', authorize('admin'), generateDailyDigest);
router.post('/weekly/generate', authorize('admin'), generateWeeklyDigest);

module.exports = router;
