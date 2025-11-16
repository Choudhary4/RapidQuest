require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const config = require('./config');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');
const { initCronJobs } = require('./jobs/cronJobs');

// Import routes
const authRoutes = require('./routes/auth');
const competitorRoutes = require('./routes/competitors');
const updateRoutes = require('./routes/updates');
const alertRoutes = require('./routes/alerts');
const analyticsRoutes = require('./routes/analytics');
const digestRoutes = require('./routes/digestRoutes');
const comparisonRoutes = require('./routes/comparisonRoutes');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later'
});

app.use('/api', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// API routes
const API_PREFIX = `/api/${config.apiVersion}`;

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/competitors`, competitorRoutes);
app.use(`${API_PREFIX}/updates`, updateRoutes);
app.use(`${API_PREFIX}/alerts`, alertRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/digest`, digestRoutes);
app.use(`${API_PREFIX}/comparison`, comparisonRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${config.env} mode on port ${PORT}`);
  logger.info(`API available at http://localhost:${PORT}${API_PREFIX}`);

  // Initialize cron jobs
  if (config.env !== 'test') {
    initCronJobs();
    logger.info('Background jobs started');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = app;
