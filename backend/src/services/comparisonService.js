const Competitor = require('../models/Competitor');
const Update = require('../models/Update');
const ComparisonMatrix = require('../models/ComparisonMatrix');
const classificationService = require('./classificationService');
const logger = require('../utils/logger');
const { subDays } = require('date-fns');

class ComparisonService {
  constructor() {
    this.classificationService = classificationService;
  }

  /**
   * Generate AI-powered competitor comparison matrix
   * Compares features, pricing, campaigns, and activity across all competitors
   */
  async generateComparisonMatrix() {
    try {
      logger.info('Generating competitor comparison matrix...');

      // Fetch all active competitors
      const competitors = await Competitor.find({ active: true }).lean();

      if (competitors.length < 2) {
        logger.warn('Need at least 2 competitors to generate comparison matrix');
        return null;
      }

      // Fetch recent updates for each competitor (last 30 days)
      const thirtyDaysAgo = subDays(new Date(), 30);
      const competitorData = await Promise.all(
        competitors.map(async (competitor) => {
          const updates = await Update.find({
            companyId: competitor._id,
            createdAt: { $gte: thirtyDaysAgo }
          })
            .sort({ createdAt: -1 })
            .lean();

          return {
            competitor,
            updates,
            analytics: this.analyzeCompetitorUpdates(updates)
          };
        })
      );

      // Build comparison data structure
      const comparisonData = this.buildComparisonData(competitorData);

      // Generate AI-powered insights and rankings
      const aiInsights = await this.generateAIInsights(comparisonData);

      // Create comparison matrix record
      const matrix = await ComparisonMatrix.create({
        competitors: competitors.map(c => c._id),
        comparisonData,
        aiInsights,
        metadata: {
          totalCompetitors: competitors.length,
          totalUpdates: competitorData.reduce((sum, c) => sum + c.updates.length, 0),
          period: {
            start: thirtyDaysAgo,
            end: new Date()
          }
        }
      });

      logger.info(`Comparison matrix generated for ${competitors.length} competitors`);
      return matrix;
    } catch (error) {
      logger.error(`Error generating comparison matrix: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze updates for a single competitor
   */
  analyzeCompetitorUpdates(updates) {
    const categoryCount = {};
    const sentimentScores = [];
    const impactScores = [];
    const pricingUpdates = [];
    const featureUpdates = [];
    const campaignUpdates = [];

    updates.forEach(update => {
      // Count by category
      categoryCount[update.category] = (categoryCount[update.category] || 0) + 1;

      // Collect scores
      if (update.sentimentScore !== undefined) {
        sentimentScores.push(update.sentimentScore);
      }
      if (update.impactScore !== undefined) {
        impactScores.push(update.impactScore);
      }

      // Categorize specific updates
      if (update.category === 'pricing') {
        pricingUpdates.push(update);
      }
      if (update.category === 'feature_update' || update.category === 'product_launch') {
        featureUpdates.push(update);
      }
      if (update.category === 'campaign') {
        campaignUpdates.push(update);
      }
    });

    // Calculate averages
    const avgSentiment = sentimentScores.length > 0
      ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
      : 0;

    const avgImpact = impactScores.length > 0
      ? impactScores.reduce((a, b) => a + b, 0) / impactScores.length
      : 0;

    return {
      totalUpdates: updates.length,
      categoryCount,
      avgSentiment,
      avgImpact,
      pricingUpdates: pricingUpdates.length,
      featureUpdates: featureUpdates.length,
      campaignUpdates: campaignUpdates.length,
      latestPricing: pricingUpdates[0],
      latestFeature: featureUpdates[0],
      latestCampaign: campaignUpdates[0]
    };
  }

  /**
   * Build structured comparison data
   */
  buildComparisonData(competitorData) {
    const comparison = {
      features: {},
      pricing: {},
      campaigns: {},
      activity: {},
      sentiment: {}
    };

    competitorData.forEach(({ competitor, analytics }) => {
      const name = competitor.name;

      // Features comparison
      comparison.features[name] = {
        totalFeatures: analytics.featureUpdates,
        recentFeatures: analytics.latestFeature ? [
          {
            title: analytics.latestFeature.title,
            date: analytics.latestFeature.createdAt,
            impact: analytics.latestFeature.impactScore
          }
        ] : [],
        innovationScore: this.calculateInnovationScore(analytics)
      };

      // Pricing comparison
      comparison.pricing[name] = {
        totalPricingUpdates: analytics.pricingUpdates,
        latestChange: analytics.latestPricing ? {
          title: analytics.latestPricing.title,
          date: analytics.latestPricing.createdAt,
          sentiment: analytics.latestPricing.sentiment
        } : null,
        pricingAggressiveness: this.calculatePricingAggressiveness(analytics)
      };

      // Campaign comparison
      comparison.campaigns[name] = {
        totalCampaigns: analytics.campaignUpdates,
        latestCampaign: analytics.latestCampaign ? {
          title: analytics.latestCampaign.title,
          date: analytics.latestCampaign.createdAt
        } : null,
        campaignStrength: this.calculateCampaignStrength(analytics)
      };

      // Activity comparison
      comparison.activity[name] = {
        totalUpdates: analytics.totalUpdates,
        categoryBreakdown: analytics.categoryCount,
        activityScore: analytics.totalUpdates
      };

      // Sentiment comparison
      comparison.sentiment[name] = {
        averageSentiment: analytics.avgSentiment,
        averageImpact: analytics.avgImpact,
        overallScore: (analytics.avgSentiment + analytics.avgImpact) / 2
      };
    });

    return comparison;
  }

  /**
   * Calculate innovation score (0-100)
   */
  calculateInnovationScore(analytics) {
    const featureWeight = 3;
    const impactWeight = 2;
    const updateWeight = 1;

    const rawScore = (analytics.featureUpdates * featureWeight) +
                     (analytics.avgImpact * 10 * impactWeight) +
                     (analytics.totalUpdates * updateWeight);

    // Normalize to 0-100 scale
    return Math.min(100, Math.round(rawScore));
  }

  /**
   * Calculate pricing aggressiveness (0-100)
   */
  calculatePricingAggressiveness(analytics) {
    if (analytics.pricingUpdates === 0) return 0;

    const updateFrequency = analytics.pricingUpdates * 10;
    const sentimentFactor = Math.abs(analytics.avgSentiment) * 30;

    const rawScore = updateFrequency + sentimentFactor;
    return Math.min(100, Math.round(rawScore));
  }

  /**
   * Calculate campaign strength (0-100)
   */
  calculateCampaignStrength(analytics) {
    if (analytics.campaignUpdates === 0) return 0;

    const campaignFrequency = analytics.campaignUpdates * 15;
    const impactFactor = analytics.avgImpact * 20;

    const rawScore = campaignFrequency + impactFactor;
    return Math.min(100, Math.round(rawScore));
  }

  /**
   * Generate AI insights about the comparison
   */
  async generateAIInsights(comparisonData) {
    try {
      const prompt = this.buildComparisonPrompt(comparisonData);

      // Use classification service to get AI insights
      const provider = this.classificationService.provider;
      let insights;

      if (provider === 'anthropic') {
        insights = await this.classificationService.classifyWithClaude(prompt);
      } else {
        insights = await this.classificationService.classifyWithOpenAI(prompt);
      }

      // Parse and structure the response
      try {
        const parsed = JSON.parse(insights);
        return parsed;
      } catch (e) {
        // If not JSON, return as plain text
        return {
          summary: insights,
          rankings: {},
          keyFindings: []
        };
      }
    } catch (error) {
      logger.error(`Error generating AI insights: ${error.message}`);
      // Fallback to template-based insights
      return this.generateTemplateInsights(comparisonData);
    }
  }

  /**
   * Build prompt for AI insights generation
   */
  buildComparisonPrompt(comparisonData) {
    const competitorNames = Object.keys(comparisonData.features);

    // Build detailed comparison summary
    const featureSummary = competitorNames.map(name => {
      const data = comparisonData.features[name];
      return `${name}: ${data.totalFeatures} new features, innovation score ${data.innovationScore}`;
    }).join('\n');

    const pricingSummary = competitorNames.map(name => {
      const data = comparisonData.pricing[name];
      return `${name}: ${data.totalPricingUpdates} pricing updates, aggressiveness ${data.pricingAggressiveness}`;
    }).join('\n');

    const campaignSummary = competitorNames.map(name => {
      const data = comparisonData.campaigns[name];
      return `${name}: ${data.totalCampaigns} campaigns, strength ${data.campaignStrength}`;
    }).join('\n');

    const activitySummary = competitorNames.map(name => {
      const data = comparisonData.activity[name];
      return `${name}: ${data.totalUpdates} total updates`;
    }).join('\n');

    return `You are a competitive intelligence analyst. Analyze the following competitor comparison data and generate strategic insights.

Competitors: ${competitorNames.join(', ')}

Feature & Innovation Comparison:
${featureSummary}

Pricing Strategy Comparison:
${pricingSummary}

Marketing Campaign Comparison:
${campaignSummary}

Overall Activity Comparison:
${activitySummary}

Generate a comprehensive comparison analysis in the following JSON format:
{
  "summary": "2-3 paragraph executive summary comparing all competitors across features, pricing, and marketing",
  "rankings": {
    "innovation": {
      "leader": "Competitor name",
      "score": 0-100,
      "reason": "Why they lead"
    },
    "pricing": {
      "leader": "Competitor name",
      "score": 0-100,
      "reason": "Their pricing strategy"
    },
    "marketing": {
      "leader": "Competitor name",
      "score": 0-100,
      "reason": "Their marketing approach"
    },
    "overall": {
      "leader": "Competitor name",
      "reason": "Why they're winning overall"
    }
  },
  "keyFindings": [
    "Key finding about competitive positioning 1",
    "Key finding about competitive positioning 2",
    "Key finding about competitive positioning 3",
    "Key finding about market dynamics"
  ],
  "strengths": {
    "CompetitorName": ["Strength 1", "Strength 2"],
    "CompetitorName": ["Strength 1", "Strength 2"]
  },
  "weaknesses": {
    "CompetitorName": ["Weakness 1", "Weakness 2"],
    "CompetitorName": ["Weakness 1", "Weakness 2"]
  },
  "recommendations": [
    "Strategic recommendation 1",
    "Strategic recommendation 2",
    "Strategic recommendation 3"
  ]
}

Write like a professional competitive analyst presenting to senior leadership. Be specific, insightful, and actionable.`;
  }

  /**
   * Generate template-based insights (fallback)
   */
  generateTemplateInsights(comparisonData) {
    const competitorNames = Object.keys(comparisonData.features);

    // Find leaders in each category
    const innovationLeader = this.findLeader(comparisonData.features, 'innovationScore');
    const pricingLeader = this.findLeader(comparisonData.pricing, 'pricingAggressiveness');
    const campaignLeader = this.findLeader(comparisonData.campaigns, 'campaignStrength');
    const activityLeader = this.findLeader(comparisonData.activity, 'activityScore');

    return {
      summary: `Competitive analysis across ${competitorNames.length} competitors shows ${innovationLeader.name} leading in innovation (score: ${innovationLeader.score}), ${pricingLeader.name} most aggressive in pricing (score: ${pricingLeader.score}), and ${campaignLeader.name} strongest in marketing campaigns (score: ${campaignLeader.score}). ${activityLeader.name} shows the highest overall activity with ${activityLeader.score} updates.`,
      rankings: {
        innovation: {
          leader: innovationLeader.name,
          score: innovationLeader.score,
          reason: 'Most new features and product updates'
        },
        pricing: {
          leader: pricingLeader.name,
          score: pricingLeader.score,
          reason: 'Most frequent pricing changes'
        },
        marketing: {
          leader: campaignLeader.name,
          score: campaignLeader.score,
          reason: 'Strongest campaign presence'
        },
        overall: {
          leader: activityLeader.name,
          reason: 'Highest overall market activity'
        }
      },
      keyFindings: [
        `${innovationLeader.name} is driving product innovation`,
        `${pricingLeader.name} employing aggressive pricing strategy`,
        `${campaignLeader.name} leading marketing efforts`,
        `Market shows competitive activity across all fronts`
      ],
      strengths: this.buildStrengthsWeaknesses(comparisonData, 'strengths'),
      weaknesses: this.buildStrengthsWeaknesses(comparisonData, 'weaknesses'),
      recommendations: [
        'Monitor innovation leaders for market trends',
        'Analyze pricing strategies for competitive response',
        'Benchmark marketing campaigns against leaders'
      ]
    };
  }

  /**
   * Find leader in a category
   */
  findLeader(categoryData, scoreKey) {
    let leader = { name: 'Unknown', score: 0 };

    Object.entries(categoryData).forEach(([name, data]) => {
      if (data[scoreKey] > leader.score) {
        leader = { name, score: data[scoreKey] };
      }
    });

    return leader;
  }

  /**
   * Build strengths/weaknesses by competitor
   */
  buildStrengthsWeaknesses(comparisonData, type) {
    const result = {};
    const competitorNames = Object.keys(comparisonData.features);

    competitorNames.forEach(name => {
      const scores = {
        innovation: comparisonData.features[name].innovationScore,
        pricing: comparisonData.pricing[name].pricingAggressiveness,
        campaigns: comparisonData.campaigns[name].campaignStrength
      };

      // Find top and bottom scores
      const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);

      if (type === 'strengths') {
        result[name] = sorted.slice(0, 2).map(([key, val]) =>
          `${key.charAt(0).toUpperCase() + key.slice(1)} (score: ${val})`
        );
      } else {
        result[name] = sorted.slice(-2).map(([key, val]) =>
          `${key.charAt(0).toUpperCase() + key.slice(1)} (score: ${val})`
        );
      }
    });

    return result;
  }

  /**
   * Get latest comparison matrix
   */
  async getLatestMatrix() {
    return await ComparisonMatrix.findOne()
      .sort({ createdAt: -1 })
      .populate('competitors', 'name industry baseUrl');
  }

  /**
   * Get comparison history
   */
  async getMatrixHistory(limit = 10) {
    return await ComparisonMatrix.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('competitors', 'name industry')
      .select('-comparisonData');
  }
}

module.exports = new ComparisonService();
