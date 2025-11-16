require('dotenv').config();

module.exports = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  apiVersion: process.env.API_VERSION || 'v1',

  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/competitive-monitoring',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',

  // AI APIs
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,

  // Email
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  gmailUser: process.env.GMAIL_USER,
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD,
  fromEmail: process.env.FROM_EMAIL || 'alerts@example.com',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',

  // Scraping
  scrapeIntervalMinutes: parseInt(process.env.SCRAPE_INTERVAL_MINUTES) || 10,
  userAgent: process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || 'logs/app.log',
};
