const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
  })
);

// Determine if we're in a serverless environment (like Vercel)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.FUNCTION_NAME;

// Create transports based on environment
const transports = [];

// Only use file transports if not in serverless environment
if (!isServerless) {
  try {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Add file transports
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        maxsize: 5242880,
        maxFiles: 5
      })
    );
  } catch (error) {
    // If file system is not writable, skip file transports
    console.error('Unable to create log directory, using console only:', error.message);
  }
}

// Always add console transport
transports.push(
  new winston.transports.Console({
    format: config.env !== 'production' ? consoleFormat : logFormat
  })
);

// Create logger
const logger = winston.createLogger({
  level: config.logLevel,
  format: logFormat,
  transports
});

module.exports = logger;
