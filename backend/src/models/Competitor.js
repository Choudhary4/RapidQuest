const mongoose = require('mongoose');

const competitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Competitor name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  baseUrl: {
    type: String,
    required: [true, 'Base URL is required'],
    trim: true
  },
  scrapeTargets: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['pricing', 'news', 'press', 'blog', 'product'],
      required: true
    },
    selector: {
      type: String,
      default: null
    }
  }],
  active: {
    type: Boolean,
    default: true
  },
  lastScrapedAt: {
    type: Date,
    default: null
  },
  scrapeFrequency: {
    type: Number,
    default: 10, // minutes
    min: 5
  },
  industry: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes for performance
competitorSchema.index({ name: 1 });
competitorSchema.index({ active: 1 });
competitorSchema.index({ lastScrapedAt: 1 });

// Virtual for updates
competitorSchema.virtual('updates', {
  ref: 'Update',
  localField: '_id',
  foreignField: 'companyId'
});

module.exports = mongoose.model('Competitor', competitorSchema);
