const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  updateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Update',
    required: true,
    index: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competitor',
    required: true,
    index: true
  },
  rule: {
    type: String,
    enum: [
      'price_drop',
      'price_increase',
      'new_product',
      'campaign_detected',
      'negative_news',
      'update_spike',
      'high_impact',
      'custom'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  notified: {
    type: Boolean,
    default: false
  },
  notifiedAt: {
    type: Date,
    default: null
  },
  notificationChannels: [{
    type: String,
    enum: ['email', 'in_app', 'slack', 'webhook']
  }],
  metadata: {
    previousValue: String,
    newValue: String,
    changePercentage: Number,
    triggerThreshold: Number
  }
}, {
  timestamps: true
});

// Indexes
alertSchema.index({ read: 1, createdAt: -1 });
alertSchema.index({ severity: 1, createdAt: -1 });
alertSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
