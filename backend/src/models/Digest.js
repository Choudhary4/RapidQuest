const mongoose = require('mongoose');

const digestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['daily', 'weekly'],
      required: true,
      index: true
    },
    period: {
      start: {
        type: Date,
        required: true
      },
      end: {
        type: Date,
        required: true
      }
    },
    summary: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    metadata: {
      totalUpdates: Number,
      competitorsActive: Number,
      categories: mongoose.Schema.Types.Mixed,
      topCompetitor: mongoose.Schema.Types.Mixed,
      trends: mongoose.Schema.Types.Mixed
    },
    updates: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Update'
    }],
    emailSent: {
      type: Boolean,
      default: false
    },
    emailSentAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
digestSchema.index({ createdAt: -1 });
digestSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Digest', digestSchema);
