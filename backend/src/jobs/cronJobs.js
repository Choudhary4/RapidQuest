const cron = require('node-cron');
const Competitor = require('../models/Competitor');
const Update = require('../models/Update');
const scraperService = require('../services/scraperService');
const classificationService = require('../services/classificationService');
const alertService = require('../services/alertService');
const digestService = require('../services/digestService');
const comparisonService = require('../services/comparisonService');
const logger = require('../utils/logger');

/**
 * Scrape all active competitors
 */
async function scrapeAllCompetitors() {
  try {
    logger.info('Starting scheduled scrape for all competitors');

    const competitors = await Competitor.find({ active: true });

    for (const competitor of competitors) {
      try {
        await scrapeCompetitor(competitor);
      } catch (error) {
        logger.error(`Failed to scrape ${competitor.name}: ${error.message}`);
      }
    }

    logger.info(`Scheduled scrape completed for ${competitors.length} competitors`);
  } catch (error) {
    logger.error(`Scheduled scrape failed: ${error.message}`);
  }
}

/**
 * Scrape single competitor
 */
async function scrapeCompetitor(competitor) {
  logger.info(`Scraping: ${competitor.name}`);

  let newUpdatesCount = 0;

  for (const target of competitor.scrapeTargets) {
    try {
      const scrapedData = await scraperService.scrapeTarget(target, competitor.baseUrl);

      if (Array.isArray(scrapedData)) {
        for (const item of scrapedData) {
          // Check if already exists
          const exists = await Update.findOne({ url: item.url });
          if (exists) {
            logger.debug(`Skipping duplicate: ${item.url}`);
            continue;
          }

          // Classify the update
          const classification = await classificationService.classifyUpdate(
            item.title || '',
            item.summary || '',
            item.content || ''
          );

          // Create update
          const update = await Update.create({
            companyId: competitor._id,
            title: item.title,
            summary: item.summary,
            content: item.content,
            url: item.url,
            sourceType: target.type,
            ...classification,
            detectedAt: item.date || new Date(),
            metadata: {
              imageUrl: item.imageUrl
            }
          });

          logger.info(`New update detected: ${item.title}`);
          newUpdatesCount++;

          // Process alerts
          await alertService.processUpdate(update);

          // Small delay to avoid overwhelming the AI API
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      logger.error(`Target scrape failed ${target.url}: ${error.message}`);
    }
  }

  // Update last scraped time
  competitor.lastScrapedAt = new Date();
  await competitor.save();

  logger.info(`${competitor.name}: Found ${newUpdatesCount} new updates`);

  // Check for update spikes
  if (newUpdatesCount >= 5) {
    await alertService.checkUpdateSpike(competitor._id);
  }
}

/**
 * Re-classify unprocessed updates
 */
async function reclassifyUpdates() {
  try {
    logger.info('Starting re-classification of unprocessed updates');

    const updates = await Update.find({
      processed: false,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).limit(50);

    for (const update of updates) {
      try {
        const classification = await classificationService.classifyUpdate(
          update.title,
          update.summary,
          update.content
        );

        update.category = classification.category;
        update.confidence = classification.confidence;
        update.sentiment = classification.sentiment;
        update.sentimentScore = classification.sentimentScore;
        update.impactScore = classification.impactScore;
        update.entities = classification.entities;
        update.processed = true;

        await update.save();

        logger.debug(`Re-classified: ${update.title}`);

        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        logger.error(`Re-classification failed for ${update._id}: ${error.message}`);
      }
    }

    logger.info(`Re-classified ${updates.length} updates`);
  } catch (error) {
    logger.error(`Re-classification job failed: ${error.message}`);
  }
}

/**
 * Clean up old logs and data
 */
async function cleanup() {
  try {
    logger.info('Starting cleanup job');

    // Delete old logs (older than 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // Mark old updates as processed
    await Update.updateMany(
      { createdAt: { $lt: ninetyDaysAgo }, processed: false },
      { processed: true }
    );

    logger.info('Cleanup job completed');
  } catch (error) {
    logger.error(`Cleanup job failed: ${error.message}`);
  }
}

/**
 * Calculate and cache analytics
 */
async function calculateAnalytics() {
  try {
    logger.info('Calculating analytics');

    // This can be extended to pre-calculate complex analytics
    // and store them in a cache or separate collection for faster dashboard loading

    logger.info('Analytics calculation completed');
  } catch (error) {
    logger.error(`Analytics calculation failed: ${error.message}`);
  }
}

/**
 * Generate daily digest
 */
async function generateDailyDigest() {
  try {
    logger.info('Generating scheduled daily digest');
    const digest = await digestService.generateDailyDigest();

    if (digest) {
      logger.info(`Daily digest generated successfully (ID: ${digest._id})`);
    } else {
      logger.info('No updates available for daily digest');
    }
  } catch (error) {
    logger.error(`Daily digest generation failed: ${error.message}`);
  }
}

/**
 * Generate weekly digest
 */
async function generateWeeklyDigest() {
  try {
    logger.info('Generating scheduled weekly digest');
    const digest = await digestService.generateWeeklyDigest();

    if (digest) {
      logger.info(`Weekly digest generated successfully (ID: ${digest._id})`);
    } else {
      logger.info('No updates available for weekly digest');
    }
  } catch (error) {
    logger.error(`Weekly digest generation failed: ${error.message}`);
  }
}

/**
 * Generate comparison matrix
 */
async function generateComparisonMatrix() {
  try {
    logger.info('Generating scheduled comparison matrix');
    const matrix = await comparisonService.generateComparisonMatrix();

    if (matrix) {
      logger.info(`Comparison matrix generated successfully (ID: ${matrix._id})`);
    } else {
      logger.info('Not enough competitors for comparison matrix');
    }
  } catch (error) {
    logger.error(`Comparison matrix generation failed: ${error.message}`);
  }
}

/**
 * Initialize all cron jobs
 */
function initCronJobs() {
  // Scrape competitors every 10 minutes
  cron.schedule('*/10 * * * *', () => {
    scrapeAllCompetitors();
  });

  // Re-classify updates every hour
  cron.schedule('0 * * * *', () => {
    reclassifyUpdates();
  });

  // Daily cleanup at 2 AM
  cron.schedule('0 2 * * *', () => {
    cleanup();
  });

  // Calculate analytics every 6 hours
  cron.schedule('0 */6 * * *', () => {
    calculateAnalytics();
  });

  // Generate daily digest at 8 AM every day
  cron.schedule('0 8 * * *', () => {
    generateDailyDigest();
  });

  // Generate weekly digest every Monday at 8 AM
  cron.schedule('0 8 * * 1', () => {
    generateWeeklyDigest();
  });

  // Generate comparison matrix daily at 9 AM
  cron.schedule('0 9 * * *', () => {
    generateComparisonMatrix();
  });

  logger.info('Cron jobs initialized');
}

module.exports = {
  initCronJobs,
  scrapeAllCompetitors,
  scrapeCompetitor,
  reclassifyUpdates,
  cleanup,
  calculateAnalytics,
  generateDailyDigest,
  generateWeeklyDigest,
  generateComparisonMatrix
};
