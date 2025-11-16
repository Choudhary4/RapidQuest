/**
 * Script to bulk import competitors
 * Usage: node scripts/importCompetitors.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Competitor = require('../src/models/Competitor');
const config = require('../src/config');
const logger = require('../src/utils/logger');

// Sample competitors to import
const competitors = [
  {
    name: 'Stripe',
    baseUrl: 'https://stripe.com',
    industry: 'Payment Processing',
    scrapeTargets: [
      { name: 'Pricing Page', url: '/pricing', type: 'pricing' },
      { name: 'Blog', url: '/blog', type: 'news' },
      { name: 'Product Updates', url: '/newsroom', type: 'press' }
    ]
  },
  {
    name: 'Notion',
    baseUrl: 'https://www.notion.so',
    industry: 'Productivity',
    scrapeTargets: [
      { name: 'Pricing', url: '/pricing', type: 'pricing' },
      { name: "What's New", url: '/releases', type: 'product' },
      { name: 'Blog', url: '/blog', type: 'news' }
    ]
  },
  {
    name: 'Shopify',
    baseUrl: 'https://www.shopify.com',
    industry: 'E-commerce',
    scrapeTargets: [
      { name: 'Pricing Plans', url: '/pricing', type: 'pricing' },
      { name: 'Blog', url: '/blog', type: 'news' },
      { name: 'Changelog', url: '/changelog', type: 'product' }
    ]
  },
  {
    name: 'Vercel',
    baseUrl: 'https://vercel.com',
    industry: 'Cloud Hosting',
    scrapeTargets: [
      { name: 'Pricing', url: '/pricing', type: 'pricing' },
      { name: 'Blog', url: '/blog', type: 'news' },
      { name: 'Changelog', url: '/changelog', type: 'product' }
    ]
  },
  {
    name: 'Linear',
    baseUrl: 'https://linear.app',
    industry: 'Project Management',
    scrapeTargets: [
      { name: 'Pricing', url: '/pricing', type: 'pricing' },
      { name: 'Changelog', url: '/changelog', type: 'product' },
      { name: 'Blog', url: '/blog', type: 'news' }
    ]
  },
  {
    name: 'Figma',
    baseUrl: 'https://www.figma.com',
    industry: 'Design Tools',
    scrapeTargets: [
      { name: 'Pricing', url: '/pricing', type: 'pricing' },
      { name: 'Blog', url: '/blog', type: 'news' },
      { name: "What's New", url: '/whats-new', type: 'product' }
    ]
  },
  {
    name: 'Airtable',
    baseUrl: 'https://www.airtable.com',
    industry: 'Database / No-Code',
    scrapeTargets: [
      { name: 'Pricing', url: '/pricing', type: 'pricing' },
      { name: 'Blog', url: '/blog', type: 'news' },
      { name: 'Product Updates', url: '/releases', type: 'product' }
    ]
  },
  {
    name: 'GitHub',
    baseUrl: 'https://github.com',
    industry: 'Developer Tools',
    scrapeTargets: [
      { name: 'Pricing', url: '/pricing', type: 'pricing' },
      { name: 'Blog', url: '/blog', type: 'news' },
      { name: 'Changelog', url: '/changelog', type: 'product' }
    ]
  }
];

async function importCompetitors() {
  try {
    // Connect to MongoDB
    console.log('\n🔌 Connecting to MongoDB...');
    console.log(`   Database URI: ${config.mongoUri.replace(/:[^:]*@/, ':****@')}\n`);

    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB');
    console.log('✅ Connected to MongoDB\n');

    console.log('📊 Starting competitor import...\n');

    let imported = 0;
    let skipped = 0;

    for (const competitorData of competitors) {
      // Check if competitor already exists
      const existing = await Competitor.findOne({
        name: competitorData.name
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${competitorData.name} (already exists)`);
        skipped++;
        continue;
      }

      // Create competitor
      await Competitor.create(competitorData);
      console.log(`✅ Imported: ${competitorData.name}`);
      imported++;
    }

    console.log('\n📈 Import Summary:');
    console.log(`✅ Imported: ${imported}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📊 Total: ${competitors.length}\n`);

    logger.info(`Competitor import completed: ${imported} imported, ${skipped} skipped`);
  } catch (error) {
    logger.error(`Error importing competitors: ${error.message}`);
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

importCompetitors();
