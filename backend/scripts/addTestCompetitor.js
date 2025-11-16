/**
 * Script to add a test competitor with reliable endpoints
 * Usage: node scripts/addTestCompetitor.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Competitor = require('../src/models/Competitor');
const config = require('../src/config');
const logger = require('../src/utils/logger');

const testCompetitor = {
  name: 'Example.com (Test)',
  baseUrl: 'https://example.com',
  industry: 'Test',
  scrapeTargets: [
    {
      name: 'Homepage',
      url: '/',
      type: 'news'
    }
  ]
};

async function addTestCompetitor() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB');

    // Check if exists
    const existing = await Competitor.findOne({ name: testCompetitor.name });

    if (existing) {
      console.log('\n⏭️  Test competitor already exists\n');
      process.exit(0);
    }

    // Create
    const competitor = await Competitor.create(testCompetitor);
    console.log('\n✅ Test competitor added successfully!');
    console.log(`ID: ${competitor._id}`);
    console.log('\nNow trigger a refresh from the Competitors page or run:');
    console.log(`curl -X POST http://localhost:5000/api/v1/updates/refresh -H "Content-Type: application/json" -d '{"competitorId": "${competitor._id}"}'\n`);

    process.exit(0);
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

addTestCompetitor();
