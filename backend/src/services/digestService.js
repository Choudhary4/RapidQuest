const Update = require('../models/Update');
const Competitor = require('../models/Competitor');
const Digest = require('../models/Digest');
const classificationService = require('./classificationService');
const logger = require('../utils/logger');
const { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek } = require('date-fns');

class DigestService {
  constructor() {
    this.classificationService = classificationService;
  }

  /**
   * Generate daily summary digest
   * Analyzes all updates from the last 24 hours
   */
  async generateDailyDigest() {
    try {
      logger.info('Generating daily digest...');

      const today = new Date();
      const yesterday = subDays(today, 1);

      // Fetch updates from last 24 hours
      const updates = await Update.find({
        createdAt: {
          $gte: startOfDay(yesterday),
          $lte: endOfDay(today)
        }
      })
        .populate('companyId', 'name industry')
        .sort({ createdAt: -1 })
        .lean();

      if (updates.length === 0) {
        logger.info('No updates found for daily digest');
        return null;
      }

      // Aggregate data for analysis
      const analytics = this.aggregateUpdatesData(updates);

      // Generate AI-powered summary
      const aiSummary = await this.generateAISummary('daily', updates, analytics);

      // Create digest record
      const digest = await Digest.create({
        type: 'daily',
        period: {
          start: startOfDay(yesterday),
          end: endOfDay(today)
        },
        summary: aiSummary,
        metadata: {
          totalUpdates: updates.length,
          competitorsActive: analytics.activeCompetitors.length,
          categories: analytics.categoryBreakdown,
          topCompetitor: analytics.mostActiveCompetitor
        },
        updates: updates.map(u => u._id)
      });

      logger.info(`Daily digest generated successfully with ${updates.length} updates`);
      return digest;
    } catch (error) {
      logger.error(`Error generating daily digest: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate weekly strategy insights digest
   * Analyzes all updates from the last 7 days
   */
  async generateWeeklyDigest() {
    try {
      logger.info('Generating weekly digest...');

      const today = new Date();
      const lastWeek = subDays(today, 7);

      // Fetch updates from last 7 days
      const updates = await Update.find({
        createdAt: {
          $gte: startOfWeek(lastWeek),
          $lte: endOfWeek(today)
        }
      })
        .populate('companyId', 'name industry baseUrl')
        .sort({ createdAt: -1 })
        .lean();

      if (updates.length === 0) {
        logger.info('No updates found for weekly digest');
        return null;
      }

      // Aggregate data for strategic analysis
      const analytics = this.aggregateUpdatesData(updates);
      const strategicInsights = await this.analyzeStrategicTrends(updates, analytics);

      // Generate AI-powered weekly insights
      const aiSummary = await this.generateAISummary('weekly', updates, {
        ...analytics,
        ...strategicInsights
      });

      // Create digest record
      const digest = await Digest.create({
        type: 'weekly',
        period: {
          start: startOfWeek(lastWeek),
          end: endOfWeek(today)
        },
        summary: aiSummary,
        metadata: {
          totalUpdates: updates.length,
          competitorsActive: analytics.activeCompetitors.length,
          categories: analytics.categoryBreakdown,
          trends: strategicInsights
        },
        updates: updates.map(u => u._id)
      });

      logger.info(`Weekly digest generated successfully with ${updates.length} updates`);
      return digest;
    } catch (error) {
      logger.error(`Error generating weekly digest: ${error.message}`);
      throw error;
    }
  }

  /**
   * Aggregate updates data for analysis
   */
  aggregateUpdatesData(updates) {
    const categoryBreakdown = {};
    const competitorActivity = {};
    const pricingChanges = [];
    const productLaunches = [];
    const campaigns = [];
    const negativeNews = [];

    updates.forEach(update => {
      // Category breakdown
      categoryBreakdown[update.category] = (categoryBreakdown[update.category] || 0) + 1;

      // Competitor activity
      const companyName = update.companyId?.name || 'Unknown';
      if (!competitorActivity[companyName]) {
        competitorActivity[companyName] = {
          name: companyName,
          count: 0,
          categories: {},
          avgImpact: 0,
          impactScores: []
        };
      }
      competitorActivity[companyName].count++;
      competitorActivity[companyName].categories[update.category] =
        (competitorActivity[companyName].categories[update.category] || 0) + 1;
      competitorActivity[companyName].impactScores.push(update.impactScore || 0);

      // Collect specific update types
      if (update.category === 'pricing') {
        pricingChanges.push(update);
      }
      if (update.category === 'product_launch') {
        productLaunches.push(update);
      }
      if (update.category === 'campaign') {
        campaigns.push(update);
      }
      if (update.category === 'negative_news') {
        negativeNews.push(update);
      }
    });

    // Calculate average impact scores
    Object.keys(competitorActivity).forEach(key => {
      const scores = competitorActivity[key].impactScores;
      competitorActivity[key].avgImpact =
        scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    // Find most active competitor
    const mostActiveCompetitor = Object.values(competitorActivity)
      .sort((a, b) => b.count - a.count)[0];

    return {
      categoryBreakdown,
      competitorActivity,
      activeCompetitors: Object.keys(competitorActivity),
      mostActiveCompetitor,
      pricingChanges,
      productLaunches,
      campaigns,
      negativeNews
    };
  }

  /**
   * Analyze strategic trends for weekly digest
   */
  async analyzeStrategicTrends(updates, analytics) {
    const { competitorActivity, pricingChanges, productLaunches } = analytics;

    // Innovation leader (most product launches + feature updates)
    const innovationScores = Object.values(competitorActivity).map(comp => ({
      name: comp.name,
      score: (comp.categories.product_launch || 0) + (comp.categories.feature_update || 0)
    })).sort((a, b) => b.score - a.score);

    const innovationLeader = innovationScores[0];

    // Aggressive discounter (most pricing changes with negative sentiment)
    const discountingCompetitors = pricingChanges
      .filter(p => p.sentiment === 'negative' || p.sentimentScore < -0.3)
      .reduce((acc, p) => {
        const name = p.companyId?.name || 'Unknown';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

    const aggressiveDiscounter = Object.entries(discountingCompetitors)
      .sort(([, a], [, b]) => b - a)[0];

    // Growing product lines (by category distribution)
    const productLineGrowth = Object.values(competitorActivity)
      .map(comp => ({
        name: comp.name,
        productUpdates: (comp.categories.product_launch || 0) +
                       (comp.categories.feature_update || 0),
        avgImpact: comp.avgImpact
      }))
      .filter(c => c.productUpdates > 0)
      .sort((a, b) => b.productUpdates - a.productUpdates);

    // Campaign activity
    const campaignLeaders = Object.values(competitorActivity)
      .map(comp => ({
        name: comp.name,
        campaigns: comp.categories.campaign || 0
      }))
      .filter(c => c.campaigns > 0)
      .sort((a, b) => b.campaigns - a.campaigns);

    return {
      innovationLeader: innovationLeader?.name,
      innovationScore: innovationLeader?.score || 0,
      aggressiveDiscounter: aggressiveDiscounter?.[0],
      discountCount: aggressiveDiscounter?.[1] || 0,
      productLineGrowth: productLineGrowth[0],
      campaignLeader: campaignLeaders[0]
    };
  }

  /**
   * Generate AI-powered summary using LLM
   */
  async generateAISummary(type, updates, analytics) {
    try {
      const prompt = this.buildPrompt(type, updates, analytics);

      // Use classification service to get AI summary
      const provider = this.classificationService.provider;
      let summary;

      if (provider === 'anthropic') {
        summary = await this.classificationService.classifyWithClaude(prompt);
      } else {
        summary = await this.classificationService.classifyWithOpenAI(prompt);
      }

      // Parse and structure the response
      try {
        const parsed = JSON.parse(summary);
        return parsed;
      } catch (e) {
        // If not JSON, return as plain text
        return {
          headline: type === 'daily' ? 'Daily Market Update' : 'Weekly Strategy Insights',
          summary: summary,
          highlights: []
        };
      }
    } catch (error) {
      logger.error(`Error generating AI summary: ${error.message}`);
      // Fallback to template-based summary
      return this.generateTemplateSummary(type, updates, analytics);
    }
  }

  /**
   * Build prompt for AI summary generation
   */
  buildPrompt(type, updates, analytics) {
    if (type === 'daily') {
      return `You are a competitive intelligence analyst. Analyze the following competitor updates from the last 24 hours and generate a concise daily summary.

Updates Data:
- Total Updates: ${updates.length}
- Active Competitors: ${analytics.activeCompetitors.join(', ')}
- Category Breakdown: ${JSON.stringify(analytics.categoryBreakdown)}
- Major Pricing Changes: ${analytics.pricingChanges.length}
- New Product Launches: ${analytics.productLaunches.length}
- Campaign Updates: ${analytics.campaigns.length}
- Negative Press: ${analytics.negativeNews.length}

Key Updates:
${updates.slice(0, 10).map(u => `- ${u.companyId?.name}: ${u.title} (${u.category})`).join('\n')}

Generate a daily summary in the following JSON format:
{
  "headline": "Eye-catching headline about today's market activity",
  "summary": "2-3 paragraph executive summary written like a professional analyst",
  "highlights": [
    "Key highlight 1",
    "Key highlight 2",
    "Key highlight 3"
  ],
  "majorPricingMoves": "Summary of any pricing changes",
  "productAnnouncements": "Summary of new products/features",
  "campaignChanges": "Summary of marketing campaigns",
  "negativePress": "Summary of any negative news"
}

Write in a professional, analytical tone. Be specific about competitor names and actions.`;
    } else {
      return `You are a competitive strategy analyst. Analyze the following competitor activity from the last 7 days and generate weekly strategic insights.

Weekly Analytics:
- Total Updates: ${updates.length}
- Active Competitors: ${analytics.activeCompetitors.join(', ')}
- Category Breakdown: ${JSON.stringify(analytics.categoryBreakdown)}
- Innovation Leader: ${analytics.innovationLeader} (${analytics.innovationScore} product updates)
- Aggressive Discounter: ${analytics.aggressiveDiscounter} (${analytics.discountCount} price cuts)
- Product Line Growth: ${analytics.productLineGrowth?.name} (${analytics.productLineGrowth?.productUpdates} updates)
- Campaign Leader: ${analytics.campaignLeader?.name} (${analytics.campaignLeader?.campaigns} campaigns)

Top Updates:
${updates.slice(0, 15).map(u => `- ${u.companyId?.name}: ${u.title} (${u.category}, impact: ${u.impactScore})`).join('\n')}

Generate weekly strategy insights in the following JSON format:
{
  "headline": "Strategic headline about this week's competitive landscape",
  "executiveSummary": "3-4 paragraph strategic analysis written like a senior analyst presenting to leadership",
  "strategicInsights": [
    "Who is leading in innovation and why?",
    "Which competitor is discounting aggressively and what does it mean?",
    "Which product lines are growing and emerging trends?",
    "What are the competitive threats and opportunities?"
  ],
  "competitorRankings": {
    "innovation": "Competitor name and reason",
    "pricing": "Competitor name and strategy",
    "marketing": "Competitor name and approach"
  },
  "recommendations": [
    "Strategic recommendation 1",
    "Strategic recommendation 2",
    "Strategic recommendation 3"
  ]
}

Write like a seasoned competitive intelligence professional presenting to executives. Be insightful and actionable.`;
    }
  }

  /**
   * Generate template-based summary (fallback)
   */
  generateTemplateSummary(type, updates, analytics) {
    if (type === 'daily') {
      return {
        headline: `${updates.length} Competitor Updates Detected Today`,
        summary: `Today we tracked ${updates.length} updates across ${analytics.activeCompetitors.length} competitors. ${analytics.mostActiveCompetitor?.name} was the most active with ${analytics.mostActiveCompetitor?.count} updates. Key activity includes ${analytics.pricingChanges.length} pricing changes, ${analytics.productLaunches.length} product launches, and ${analytics.campaigns.length} new campaigns.`,
        highlights: [
          `Most Active: ${analytics.mostActiveCompetitor?.name}`,
          `Pricing Changes: ${analytics.pricingChanges.length}`,
          `Product Launches: ${analytics.productLaunches.length}`
        ],
        majorPricingMoves: analytics.pricingChanges.map(p => `${p.companyId?.name}: ${p.title}`).join('; '),
        productAnnouncements: analytics.productLaunches.map(p => `${p.companyId?.name}: ${p.title}`).join('; '),
        campaignChanges: analytics.campaigns.map(c => `${c.companyId?.name}: ${c.title}`).join('; '),
        negativePress: analytics.negativeNews.map(n => `${n.companyId?.name}: ${n.title}`).join('; ')
      };
    } else {
      return {
        headline: `Weekly Competitive Intelligence: ${updates.length} Updates Analyzed`,
        executiveSummary: `This week we monitored ${analytics.activeCompetitors.length} competitors with ${updates.length} total updates. ${analytics.innovationLeader} leads in innovation with ${analytics.innovationScore} product-related updates. ${analytics.aggressiveDiscounter || 'No competitor'} showed aggressive pricing with ${analytics.discountCount} price reductions. Overall market activity shows healthy competition across multiple fronts.`,
        strategicInsights: [
          `Innovation Leadership: ${analytics.innovationLeader} is pushing product boundaries`,
          `Pricing Strategy: ${analytics.aggressiveDiscounter || 'Market stable'} pricing dynamics`,
          `Product Growth: ${analytics.productLineGrowth?.name || 'Multiple competitors'} expanding offerings`,
          `Marketing Activity: ${analytics.campaignLeader?.name || 'Industry-wide'} campaign presence`
        ],
        competitorRankings: {
          innovation: analytics.innovationLeader,
          pricing: analytics.aggressiveDiscounter,
          marketing: analytics.campaignLeader?.name
        },
        recommendations: [
          'Monitor innovation leaders for market trends',
          'Analyze pricing strategies for competitive positioning',
          'Track product line expansions for gaps and opportunities'
        ]
      };
    }
  }

  /**
   * Get latest digest by type
   */
  async getLatestDigest(type) {
    return await Digest.findOne({ type })
      .sort({ createdAt: -1 })
      .populate('updates', 'title companyId category createdAt')
      .populate({
        path: 'updates',
        populate: { path: 'companyId', select: 'name industry' }
      });
  }

  /**
   * Get digest history
   */
  async getDigestHistory(type, limit = 30) {
    return await Digest.find(type ? { type } : {})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-updates');
  }
}

module.exports = new DigestService();
