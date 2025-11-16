/**
 * Script to reset all users (WARNING: Deletes all users!)
 * Usage: node scripts/resetUsers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const config = require('../src/config');
const logger = require('../src/utils/logger');
const readline = require('readline');

async function resetUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB');

    // Count existing users
    const count = await User.countDocuments();

    if (count === 0) {
      console.log('\nNo users found. Nothing to delete.\n');
      process.exit(0);
    }

    // Confirm deletion
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`\n⚠️  WARNING: This will delete all ${count} user(s). Are you sure? (yes/no): `, async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        await User.deleteMany({});
        console.log(`\n✓ Successfully deleted ${count} user(s)`);
        console.log('✓ Your next registration will be an admin!\n');
      } else {
        console.log('\nCancelled. No users were deleted.\n');
      }

      rl.close();
      process.exit(0);
    });

  } catch (error) {
    logger.error(`Error resetting users: ${error.message}`);
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

resetUsers();
