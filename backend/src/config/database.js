const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Cache the connection for serverless environments
let cachedConnection = null;

const connectDB = async () => {
  // If already connected in serverless, reuse connection
  if (cachedConnection && mongoose.connection.readyState === 1) {
    logger.info('Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Serverless-optimized settings
      serverSelectionTimeoutMS: 10000, // Reduced from default 30s
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      // Remove deprecated options
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    cachedConnection = conn;

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
      cachedConnection = null;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      cachedConnection = null;
    });

    // Graceful shutdown (only for non-serverless)
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    if (!isServerless) {
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      });
    }

    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    cachedConnection = null;

    // In serverless, don't exit - let the function retry
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    if (!isServerless) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
