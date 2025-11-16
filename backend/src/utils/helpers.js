const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

/**
 * Paginate query results
 */
const paginate = (page = 1, limit = 10) => {
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);

  const skip = (parsedPage - 1) * parsedLimit;

  return {
    skip,
    limit: parsedLimit,
    page: parsedPage
  };
};

/**
 * Calculate pagination metadata
 */
const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

/**
 * Sanitize object for database query
 */
const sanitizeQuery = (query) => {
  const sanitized = { ...query };
  delete sanitized.password;
  delete sanitized.__v;
  return sanitized;
};

/**
 * Sleep utility
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry async function
 */
const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
};

/**
 * Calculate percentage change
 */
const calculatePercentageChange = (oldValue, newValue) => {
  if (!oldValue || oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Extract domain from URL
 */
const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
};

/**
 * Truncate text
 */
const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

module.exports = {
  generateToken,
  verifyToken,
  paginate,
  getPaginationMeta,
  sanitizeQuery,
  sleep,
  retry,
  calculatePercentageChange,
  extractDomain,
  truncate
};
