/**
 * Script to promote a user to admin role
 * Usage: node scripts/promoteToAdmin.js <email>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const config = require('../src/config');
const logger = require('../src/utils/logger');

async function promoteToAdmin(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      logger.error(`User not found with email: ${email}`);
      process.exit(1);
    }

    // Check if already admin
    if (user.role === 'admin') {
      logger.info(`User ${email} is already an admin`);
      process.exit(0);
    }

    // Promote to admin
    user.role = 'admin';
    await user.save();

    logger.info(`✓ Successfully promoted ${email} to admin role`);
    console.log(`\n✓ User ${user.name} (${email}) is now an admin!\n`);

    process.exit(0);
  } catch (error) {
    logger.error(`Error promoting user: ${error.message}`);
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/promoteToAdmin.js <email>');
  console.error('Example: node scripts/promoteToAdmin.js user@example.com');
  process.exit(1);
}

promoteToAdmin(email);
