const { client } = require('../utils/redis');

/**
 * Cache middleware for GET routes
 * @param {number} duration - Cache duration in seconds
 */
const cache = (duration) => {
  return async (req, res, next) => {
    // Skip if not GET
    if (req.method !== 'GET') return next();

    const key = 'cache:' + req.originalUrl;
    
    try {
      const cachedResponse = await client.get(key);
      if (cachedResponse) {
        return res.status(200).json(JSON.parse(cachedResponse));
      }

      // If miss, override res.json to store in Redis
      res.originalJson = res.json;
      res.json = (data) => {
        // Only cache successful responses
        if (res.statusCode === 200) {
          client.setEx(key, duration, JSON.stringify(data));
        }
        res.originalJson(data);
      };
      next();
    } catch (err) {
      console.error('Cache middleware error:', err);
      next();
    }
  };
};

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Redis key pattern (e.g., 'cache:/api/books*')
 */
const invalidateCache = async (pattern) => {
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      console.log(`[Cache] Invalidated ${keys.length} keys for pattern: ${pattern}`);
    }
  } catch (err) {
    console.error('Invalidate cache error:', err);
  }
};

module.exports = {
  cache,
  invalidateCache
};
