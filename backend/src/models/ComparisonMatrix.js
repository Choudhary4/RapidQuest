const mongoose = require('mongoose');

const comparisonMatrixSchema = new mongoose.Schema(
  {
    competitors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competitor',
      required: true
    }],
    comparisonData: {
      features: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      pricing: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      campaigns: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      activity: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      sentiment: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      }
    },
    aiInsights: {
      summary: String,
      rankings: mongoose.Schema.Types.Mixed,
      keyFindings: [String],
      strengths: mongoose.Schema.Types.Mixed,
      weaknesses: mongoose.Schema.Types.Mixed,
      recommendations: [String]
    },
    metadata: {
      totalCompetitors: Number,
      totalUpdates: Number,
      period: {
        start: Date,
        end: Date
      }
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
comparisonMatrixSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ComparisonMatrix', comparisonMatrixSchema);
