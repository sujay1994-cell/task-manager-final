const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');
const { createClient } = require('redis');
const os = require('os');

class MonitoringService {
  constructor() {
    // Initialize Winston logger
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        // Console logging
        new winston.transports.Console({
          format: winston.format.simple()
        }),
        // File logging
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error'
        }),
        new winston.transports.File({
          filename: 'logs/combined.log'
        })
      ]
    });

    // Initialize Redis for performance metrics
    this.redis = createClient({
      url: process.env.REDIS_URL
    });

    // System metrics
    this.metrics = {
      startTime: Date.now(),
      requests: 0,
      errors: 0,
      avgResponseTime: 0
    };
  }

  // Log application events
  logEvent(level, message, meta = {}) {
    this.logger.log(level, message, {
      ...meta,
      timestamp: new Date().toISOString()
    });
  }

  // Track API performance
  async trackAPICall(endpoint, duration, status) {
    try {
      await this.redis.hIncrBy('api:calls', endpoint, 1);
      await this.redis.hIncrBy('api:duration', endpoint, duration);
      
      if (status >= 400) {
        await this.redis.hIncrBy('api:errors', endpoint, 1);
      }
    } catch (error) {
      this.logEvent('error', 'Redis tracking failed', { error });
    }
  }

  // Monitor system resources
  async getSystemMetrics() {
    const metrics = {
      cpu: os.loadavg(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      uptime: process.uptime(),
      processMemory: process.memoryUsage()
    };

    try {
      await this.redis.hSet('system:metrics', {
        cpu: metrics.cpu[0],
        memoryUsed: metrics.memory.used,
        uptime: metrics.uptime
      });
    } catch (error) {
      this.logEvent('error', 'Failed to store system metrics', { error });
    }

    return metrics;
  }

  // Track user activity
  async trackUserActivity(userId, action, details = {}) {
    const activity = {
      userId,
      action,
      details,
      timestamp: new Date()
    };

    this.logEvent('info', 'User activity', activity);
    
    try {
      await this.redis.lPush(`user:activity:${userId}`, JSON.stringify(activity));
    } catch (error) {
      this.logEvent('error', 'Failed to track user activity', { error });
    }
  }

  // Monitor file operations
  async trackFileOperation(operation, fileSize, duration) {
    try {
      await this.redis.hIncrBy('files:operations', operation, 1);
      await this.redis.hIncrBy('files:size', operation, fileSize);
      await this.redis.hIncrBy('files:duration', operation, duration);
    } catch (error) {
      this.logEvent('error', 'Failed to track file operation', { error });
    }
  }

  // Get performance report
  async getPerformanceReport() {
    try {
      const [apiCalls, apiErrors, systemMetrics] = await Promise.all([
        this.redis.hGetAll('api:calls'),
        this.redis.hGetAll('api:errors'),
        this.redis.hGetAll('system:metrics')
      ]);

      return {
        api: {
          calls: apiCalls,
          errors: apiErrors,
          errorRate: this.calculateErrorRate(apiCalls, apiErrors)
        },
        system: systemMetrics,
        uptime: Date.now() - this.metrics.startTime
      };
    } catch (error) {
      this.logEvent('error', 'Failed to generate performance report', { error });
      return null;
    }
  }

  calculateErrorRate(calls, errors) {
    const totalCalls = Object.values(calls).reduce((sum, val) => sum + parseInt(val), 0);
    const totalErrors = Object.values(errors).reduce((sum, val) => sum + parseInt(val), 0);
    return totalCalls ? (totalErrors / totalCalls) * 100 : 0;
  }
}

module.exports = new MonitoringService(); 