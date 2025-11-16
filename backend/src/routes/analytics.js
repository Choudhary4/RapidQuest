const express = require('express');
const {
  getOverview,
  getCategoryStats,
  detectSpikes,
  getTimeline
} = require('../controllers/analyticsController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/overview', getOverview);
router.get('/categories', getCategoryStats);
router.get('/spikes', detectSpikes);
router.get('/timeline', getTimeline);

module.exports = router;
