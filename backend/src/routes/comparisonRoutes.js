const express = require('express');
const router = express.Router();
const {
  getLatestMatrix,
  generateMatrix,
  getMatrixHistory
} = require('../controllers/comparisonController');
const { protect, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// Public routes (all authenticated users)
router.get('/latest', getLatestMatrix);
router.get('/history', getMatrixHistory);

// Admin-only routes
router.post('/generate', authorize('admin'), generateMatrix);

module.exports = router;
