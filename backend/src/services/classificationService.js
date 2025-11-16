const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const config = require('../config');
const logger = require('../utils/logger');
const { retry } = require('../utils/helpers');

class ClassificationService {
  constructor() {
    // Initialize Claude (MegaLLM) if API key available
    if (config.anthropicApiKey) {
      this.anthropic = new Anthropic({
        baseURL: 'https://ai.megallm.io',
        apiKey: config.anthropicApiKey
      });
    }

    // Initialize OpenAI (MegaLLM) if API key available
    if (config.openaiApiKey) {
      this.openai = new OpenAI({
        baseURL: 'https://ai.megallm.io/v1',
        apiKey: config.openaiApiKey
      });
    }

    this.provider = config.anthropicApiKey ? 'anthropic' : 'openai';
  }

  /**
   * Classify update using AI
   */
  async classifyUpdate(title, summary, content = '') {
    try {
      const text = `${title}\n\n${summary}\n\n${content}`.substring(0, 4000);

      const prompt = this.buildClassificationPrompt(text);

      let result;
      if (this.provider === 'anthropic' && this.anthropic) {
        result = await this.classifyWithClaude(prompt);
      } else if (this.provider === 'openai' && this.openai) {
        result = await this.classifyWithOpenAI(prompt);
      } else {
        // Fallback to rule-based classification
        return this.ruleBasedClassification(title, summary, content);
      }

      return this.parseClassificationResult(result);
    } catch (error) {
      logger.error(`Classification failed: ${error.message}`);
      // Fallback to rule-based
      return this.ruleBasedClassification(title, summary, content);
    }
  }

  /**
   * Build classification prompt
   */
  buildClassificationPrompt(text) {
    return `Analyze the following competitive intelligence update and classify it.

Text: ${text}

Provide a JSON response with the following structure:
{
  "category": "<one of: pricing, campaign, product_launch, feature_update, press, negative_news, other>",
  "confidence": <0-1>,
  "sentiment": "<positive, neutral, or negative>",
  "sentimentScore": <-1 to 1>,
  "impactScore": <0-10>,
  "entities": {
    "product": "<product name if mentioned>",
    "price": "<price if mentioned>",
    "discount": "<discount percentage if mentioned>",
    "date": "<date if mentioned>",
    "keywords": ["<key phrases>"]
  },
  "reasoning": "<brief explanation>"
}

Guidelines:
- pricing: Price changes, discounts, new pricing tiers
- campaign: Marketing campaigns, promotions, advertising
- product_launch: New product announcements
- feature_update: New features, improvements
- press: Press releases, media coverage
- negative_news: Controversies, problems, bad press
- other: Everything else

- sentiment: Overall tone (positive, neutral, negative)
- sentimentScore: -1 (very negative) to 1 (very positive)
- impactScore: 0-10 based on how significant this update is for competitive analysis
- confidence: 0-1 indicating how confident you are in the classification

Return ONLY the JSON, no other text.`;
  }

  /**
   * Classify using Claude
   */
  async classifyWithClaude(prompt) {
    return await retry(async () => {
      const message = await this.anthropic.messages.create({
        model: 'claude-3.5-sonnet',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return message.content[0].text;
    }, 2, 1000);
  }

  /**
   * Classify using OpenAI
   */
  async classifyWithOpenAI(prompt) {
    return await retry(async () => {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-5',
        messages: [{
          role: 'user',
          content: prompt
        }],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      return completion.choices[0].message.content;
    }, 2, 1000);
  }

  /**
   * Parse AI classification result
   */
  parseClassificationResult(result) {
    try {
      // Extract JSON from response
      let jsonText = result;

      // Try to find JSON in the response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonText);

      return {
        category: parsed.category || 'other',
        confidence: parsed.confidence || 0.5,
        sentiment: parsed.sentiment || 'neutral',
        sentimentScore: parsed.sentimentScore || 0,
        impactScore: parsed.impactScore || 5,
        entities: {
          product: parsed.entities?.product || null,
          price: parsed.entities?.price || null,
          discount: parsed.entities?.discount || null,
          date: parsed.entities?.date || null,
          keywords: parsed.entities?.keywords || []
        }
      };
    } catch (error) {
      logger.error(`Failed to parse classification result: ${error.message}`);
      return this.getDefaultClassification();
    }
  }

  /**
   * Rule-based classification fallback
   */
  ruleBasedClassification(title, summary, content) {
    const text = `${title} ${summary} ${content}`.toLowerCase();

    let category = 'other';
    let impactScore = 5;
    let sentiment = 'neutral';
    let sentimentScore = 0;

    // Category detection
    if (text.match(/\b(price|pricing|cost|\$|discount|sale|offer)\b/i)) {
      category = 'pricing';
      impactScore = 8;
    } else if (text.match(/\b(launch|introduce|unveil|announce|new product|release)\b/i)) {
      category = 'product_launch';
      impactScore = 9;
    } else if (text.match(/\b(campaign|marketing|ad|advertisement|promotion)\b/i)) {
      category = 'campaign';
      impactScore = 6;
    } else if (text.match(/\b(feature|update|improvement|enhance|upgrade)\b/i)) {
      category = 'feature_update';
      impactScore = 6;
    } else if (text.match(/\b(press release|announcement|statement)\b/i)) {
      category = 'press';
      impactScore = 5;
    } else if (text.match(/\b(controversy|scandal|problem|issue|crisis|lawsuit)\b/i)) {
      category = 'negative_news';
      impactScore = 8;
      sentiment = 'negative';
      sentimentScore = -0.7;
    }

    // Sentiment detection
    const positiveWords = ['great', 'excellent', 'innovative', 'improved', 'better', 'success'];
    const negativeWords = ['problem', 'issue', 'bug', 'failed', 'worse', 'criticism'];

    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;

    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      sentimentScore = 0.6;
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      sentimentScore = -0.6;
    }

    // Extract keywords
    const keywords = [];
    const words = text.split(/\s+/);
    const importantWords = words.filter(word =>
      word.length > 5 &&
      !['product', 'company', 'update', 'announce'].includes(word)
    ).slice(0, 5);

    return {
      category,
      confidence: 0.6,
      sentiment,
      sentimentScore,
      impactScore,
      entities: {
        product: null,
        price: null,
        discount: null,
        date: null,
        keywords: importantWords
      }
    };
  }

  /**
   * Get default classification
   */
  getDefaultClassification() {
    return {
      category: 'other',
      confidence: 0.3,
      sentiment: 'neutral',
      sentimentScore: 0,
      impactScore: 5,
      entities: {
        product: null,
        price: null,
        discount: null,
        date: null,
        keywords: []
      }
    };
  }

  /**
   * Batch classify multiple updates
   */
  async batchClassify(updates) {
    const results = [];

    for (const update of updates) {
      const classification = await this.classifyUpdate(
        update.title,
        update.summary,
        update.content
      );
      results.push({
        updateId: update._id,
        ...classification
      });

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
  }
}

module.exports = new ClassificationService();
