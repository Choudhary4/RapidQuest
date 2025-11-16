const express = require('express');
const {
  getAlerts,
  getAlert,
  markAsRead,
  markAllAsRead,
  deleteAlert
} = require('../controllers/alertController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getAlerts);
router.get('/:id', getAlert);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', authorize('admin'), deleteAlert);

module.exports = router;
