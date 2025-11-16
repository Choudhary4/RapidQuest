const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competitor',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [500, 'Title cannot be more than 500 characters']
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [2000, 'Summary cannot be more than 2000 characters']
  },
  content: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    enum: ['pricing', 'campaign', 'product_launch', 'feature_update', 'press', 'negative_news', 'other'],
    default: 'other',
    index: true
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  sentimentScore: {
    type: Number,
    min: -1,
    max: 1,
    default: 0
  },
  impactScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 5
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  entities: {
    product: {
      type: String,
      default: null
    },
    price: {
      type: String,
      default: null
    },
    discount: {
      type: String,
      default: null
    },
    date: {
      type: Date,
      default: null
    },
    keywords: [{
      type: String
    }]
  },
  detectedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  sourceType: {
    type: String,
    enum: ['pricing', 'news', 'press', 'blog', 'product'],
    required: true
  },
  processed: {
    type: Boolean,
    default: false,
    index: true
  },
  metadata: {
    imageUrl: String,
    author: String,
    tags: [String]
  }
}, {
  timestamps: true
});

// Compound indexes
updateSchema.index({ companyId: 1, detectedAt: -1 });
updateSchema.index({ category: 1, detectedAt: -1 });
updateSchema.index({ companyId: 1, category: 1 });
updateSchema.index({ detectedAt: -1, impactScore: -1 });

// Text index for search
updateSchema.index({ title: 'text', summary: 'text', content: 'text' });

module.exports = mongoose.model('Update', updateSchema);
