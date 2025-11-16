const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

// Import all models
const User = require('../src/models/User');
const Competitor = require('../src/models/Competitor');
const Update = require('../src/models/Update');
const Alert = require('../src/models/Alert');
const Digest = require('../src/models/Digest');
const ComparisonMatrix = require('../src/models/ComparisonMatrix');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt user for confirmation
 */
function askConfirmation(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Empty all collections in the database
 */
async function emptyDatabase() {
  try {
    console.log('\n🚨 WARNING: This will DELETE ALL DATA from the database! 🚨\n');
    console.log('Database:', process.env.MONGODB_URI || 'mongodb://localhost:27017/competitive-monitor');
    console.log('\nThe following collections will be emptied:');
    console.log('  - Users');
    console.log('  - Competitors');
    console.log('  - Updates');
    console.log('  - Alerts');
    console.log('  - Digests');
    console.log('  - Comparison Matrices');
    console.log('');

    const confirmed = await askConfirmation('Are you sure you want to continue? (yes/no): ');

    if (!confirmed) {
      console.log('\n❌ Operation cancelled.');
      process.exit(0);
    }

    // Double confirmation for safety
    const doubleConfirmed = await askConfirmation('\n⚠️  Last chance! Type "yes" to proceed: ');

    if (!doubleConfirmed) {
      console.log('\n❌ Operation cancelled.');
      process.exit(0);
    }

    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/competitive-monitor');
    console.log('✅ Connected to MongoDB');

    console.log('\n🗑️  Emptying database...\n');

    // Delete all documents from each collection
    const userResult = await User.deleteMany({});
    console.log(`✅ Deleted ${userResult.deletedCount} users`);

    const competitorResult = await Competitor.deleteMany({});
    console.log(`✅ Deleted ${competitorResult.deletedCount} competitors`);

    const updateResult = await Update.deleteMany({});
    console.log(`✅ Deleted ${updateResult.deletedCount} updates`);

    const alertResult = await Alert.deleteMany({});
    console.log(`✅ Deleted ${alertResult.deletedCount} alerts`);

    const digestResult = await Digest.deleteMany({});
    console.log(`✅ Deleted ${digestResult.deletedCount} digests`);

    const comparisonResult = await ComparisonMatrix.deleteMany({});
    console.log(`✅ Deleted ${comparisonResult.deletedCount} comparison matrices`);

    const totalDeleted =
      userResult.deletedCount +
      competitorResult.deletedCount +
      updateResult.deletedCount +
      alertResult.deletedCount +
      digestResult.deletedCount +
      comparisonResult.deletedCount;

    console.log(`\n✅ Database emptied successfully!`);
    console.log(`📊 Total documents deleted: ${totalDeleted}`);

  } catch (error) {
    console.error('\n❌ Error emptying database:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
emptyDatabase();
