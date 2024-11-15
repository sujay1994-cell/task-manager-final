const redis = require('redis');
const { promisify } = require('util');
const compression = require('compression');
const sharp = require('sharp');

// Redis client setup
const redisClient = redis.createClient(process.env.REDIS_URL);
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

const performanceUtils = {
  // Cache middleware
  cacheMiddleware: (duration = 300) => { // 5 minutes default
    return async (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }

      const key = `cache:${req.originalUrl}`;
      try {
        const cachedResponse = await getAsync(key);
        if (cachedResponse) {
          return res.json(JSON.parse(cachedResponse));
        }
        
        // Store original send
        const originalSend = res.json;
        res.json = function(body) {
          setAsync(key, JSON.stringify(body), 'EX', duration);
          originalSend.call(this, body);
        };
        
        next();
      } catch (error) {
        next();
      }
    };
  },

  // Compression middleware
  compressionMiddleware: compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6 // Compression level (0-9)
  }),

  // Image optimization
  optimizeImage: async (buffer, options = {}) => {
    const {
      width = 1200,
      quality = 80,
      format = 'jpeg'
    } = options;

    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      // Only resize if image is larger than target width
      if (metadata.width > width) {
        image.resize(width, null, { withoutEnlargement: true });
      }

      return await image
        .toFormat(format, { quality })
        .toBuffer();
    } catch (error) {
      console.error('Error optimizing image:', error);
      return buffer;
    }
  },

  // Batch request handler
  batchRequests: (requests) => {
    return Promise.all(
      requests.map(async (request) => {
        try {
          const response = await request();
          return { success: true, data: response };
        } catch (error) {
          return { success: false, error: error.message };
        }
      })
    );
  },

  // Rate limiter
  rateLimiter: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },

  // Clear cache by pattern
  clearCache: async (pattern) => {
    return new Promise((resolve, reject) => {
      redisClient.keys(`cache:${pattern}`, (err, keys) => {
        if (err) return reject(err);
        if (keys.length > 0) {
          redisClient.del(keys, (err) => {
            if (err) return reject(err);
            resolve(keys.length);
          });
        } else {
          resolve(0);
        }
      });
    });
  },

  // Query optimizer
  optimizeQuery: (query) => {
    // Add necessary indexes
    query.select('+createdAt +updatedAt');
    
    // Limit fields if not specifically requested
    if (!query._fields) {
      query.select('-__v');
    }

    // Add lean() for better performance when full mongoose documents aren't needed
    if (!query._mongooseOptions.lean) {
      query.lean();
    }

    return query;
  },

  // Pagination helper
  paginateResults: async (model, query = {}, options = {}) => {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      populate = ''
    } = options;

    const skip = (page - 1) * limit;
    
    const [results, total] = await Promise.all([
      model
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate(populate)
        .lean(),
      model.countDocuments(query)
    ]);

    return {
      results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Memory usage monitor
  monitorMemoryUsage: () => {
    const used = process.memoryUsage();
    const usage = {
      rss: `${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`,
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`,
      external: `${Math.round(used.external / 1024 / 1024 * 100) / 100} MB`
    };
    return usage;
  }
};

module.exports = performanceUtils; 