const express = require('express');
const { body } = require('express-validator');
const {
  getCompetitors,
  getCompetitor,
  createCompetitor,
  updateCompetitor,
  deleteCompetitor,
  getCompetitorStats
} = require('../controllers/competitorController');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// Validation rules
const competitorValidation = [
  body('name').trim().notEmpty().withMessage('Competitor name is required'),
  body('baseUrl').isURL().withMessage('Valid base URL is required'),
  body('scrapeTargets').isArray().withMessage('Scrape targets must be an array')
];

// All routes require authentication
router.use(protect);

// GET routes
router.get('/', getCompetitors);
router.get('/:id', getCompetitor);
router.get('/:id/stats', getCompetitorStats);

// Admin only routes
router.post('/', authorize('admin'), competitorValidation, validate, createCompetitor);
router.put('/:id', authorize('admin'), updateCompetitor);
router.delete('/:id', authorize('admin'), deleteCompetitor);

module.exports = router;
