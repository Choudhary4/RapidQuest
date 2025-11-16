const express = require('express');
const { body } = require('express-validator');
const {
  getUpdates,
  getUpdate,
  refreshUpdates,
  getTimeline,
  deleteUpdate
} = require('../controllers/updateController');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET routes
router.get('/', getUpdates);
router.get('/timeline', getTimeline);
router.get('/:id', getUpdate);

// Admin only routes
router.post(
  '/refresh',
  authorize('admin'),
  [body('competitorId').notEmpty().withMessage('Competitor ID is required')],
  validate,
  refreshUpdates
);
router.delete('/:id', authorize('admin'), deleteUpdate);

module.exports = router;
