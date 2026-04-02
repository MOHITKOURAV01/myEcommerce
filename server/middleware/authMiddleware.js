const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Redis client (graceful fallback if not available)
let redisClient = null;
try {
  const { createClient } = require('redis');
  if (process.env.REDIS_URL) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', () => { redisClient = null; });
    redisClient.connect().catch(() => { redisClient = null; });
  }
} catch (e) {
  redisClient = null;
}

// Protect routes — require valid access token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token provided');
  }

  // Check if token is blacklisted in Redis
  if (redisClient) {
    try {
      const isBlacklisted = await redisClient.get(`blacklist:${token}`);
      if (isBlacklisted) {
        res.status(401);
        throw new Error('Not authorized — token has been revoked');
      }
    } catch (e) {
      // Redis error — continue without blacklist check
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized — user not found');
    }

    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401);
      throw new Error('Not authorized — token has expired');
    }
    res.status(401);
    throw new Error('Not authorized — invalid token');
  }
});

// Admin-only middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized — admin access required');
  }
};

module.exports = { protect, admin, redisClient };
