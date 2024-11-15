const winston = require('winston');
const config = require('../config/test.config');

const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: config.logging.file }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

class TestLogger {
  static logError(type, error, context = {}) {
    logger.error({
      type,
      error: {
        message: error.message,
        stack: error.stack
      },
      context
    });
  }

  static logInfo(message, context = {}) {
    logger.info({
      message,
      context
    });
  }

  static logWarning(message, context = {}) {
    logger.warn({
      message,
      context
    });
  }
}

module.exports = TestLogger; 