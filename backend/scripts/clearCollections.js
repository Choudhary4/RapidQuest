const mongoose = require('mongoose');
require('dotenv').config();

// Import all models
const User = require('../src/models/User');
const Competitor = require('../src/models/Competitor');
const Update = require('../src/models/Update');
const Alert = require('../src/models/Alert');
const Digest = require('../src/models/Digest');
const ComparisonMatrix = require('../src/models/ComparisonMatrix');

/**
 * Clear specific collections based on command line arguments
 * Usage: node clearCollections.js [collections...]
 * Example: node clearCollections.js updates alerts
 * Example: node clearCollections.js all
 */

const collections = {
  users: { model: User, name: 'Users' },
  competitors: { model: Competitor, name: 'Competitors' },
  updates: { model: Update, name: 'Updates' },
  alerts: { model: Alert, name: 'Alerts' },
  digests: { model: Digest, name: 'Digests' },
  comparisons: { model: ComparisonMatrix, name: 'Comparison Matrices' }
};

async function clearCollections() {
  try {
    // Get collections to clear from command line args
    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.log('\n📖 Usage: node clearCollections.js [collections...]\n');
      console.log('Available collections:');
      Object.keys(collections).forEach(key => {
        console.log(`  - ${key}`);
      });
      console.log('  - all (clears all collections)\n');
      console.log('Examples:');
      console.log('  node clearCollections.js updates alerts');
      console.log('  node clearCollections.js all\n');
      process.exit(0);
    }

    // Determine which collections to clear
    let toClear = [];
    if (args.includes('all')) {
      toClear = Object.keys(collections);
    } else {
      toClear = args.filter(arg => collections[arg]);
      const invalid = args.filter(arg => !collections[arg] && arg !== 'all');
      if (invalid.length > 0) {
        console.log(`\n❌ Invalid collection names: ${invalid.join(', ')}`);
        console.log('Valid options:', Object.keys(collections).join(', '), 'all\n');
        process.exit(1);
      }
    }

    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/competitive-monitor');
    console.log('✅ Connected to MongoDB\n');

    console.log('🗑️  Clearing collections:\n');

    let totalDeleted = 0;

    for (const key of toClear) {
      const { model, name } = collections[key];
      const result = await model.deleteMany({});
      console.log(`✅ Deleted ${result.deletedCount} ${name.toLowerCase()}`);
      totalDeleted += result.deletedCount;
    }

    console.log(`\n✅ Collections cleared successfully!`);
    console.log(`📊 Total documents deleted: ${totalDeleted}`);

  } catch (error) {
    console.error('\n❌ Error clearing collections:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
clearCollections();
