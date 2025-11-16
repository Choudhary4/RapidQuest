/**
 * Manual scraping script - scrapes all competitors immediately
 * Usage: node scripts/scrapeNow.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const config = require('../src/config');
const { scrapeAllCompetitors } = require('../src/jobs/cronJobs');
const logger = require('../src/utils/logger');

async function runScraping() {
  try {
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB\n');

    console.log('🕷️  Starting manual scrape for all competitors...\n');

    await scrapeAllCompetitors();

    console.log('\n✅ Scraping completed!\n');
    console.log('💡 Tip: Check the Updates page to see the scraped data.\n');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    logger.error(`Manual scrape failed: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

runScraping();
