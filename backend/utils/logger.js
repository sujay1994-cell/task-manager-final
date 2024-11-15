const winston = require('winston');
const path = require('path');
require('winston-daily-rotate-file');

// Define log levels and colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(colors);

// Create format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${
      info.stack ? `\n${info.stack}` : ''
    }${
      info.suggestion ? `\nSuggestion: ${info.suggestion}` : ''
    }`
  )
);

// Create transports for different log types
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      format
    )
  }),

  // Error logs
  new winston.transports.DailyRotateFile({
    filename: path.join(__dirname, '../logs/error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error'
  }),

  // Combined logs
  new winston.transports.DailyRotateFile({
    filename: path.join(__dirname, '../logs/combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  })
];

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  format,
  transports
});

// Error classification and suggestions
const errorTypes = {
  DatabaseError: {
    pattern: /(MongoError|MongooseError|MongoDB)/i,
    suggestion: 'Check database connection and credentials'
  },
  AuthenticationError: {
    pattern: /(JsonWebTokenError|TokenExpiredError|UnauthorizedError)/i,
    suggestion: 'Verify JWT token and authentication headers'
  },
  ValidationError: {
    pattern: /(ValidationError|CastError)/i,
    suggestion: 'Check request payload against schema requirements'
  },
  FileError: {
    pattern: /(ENOENT|EPERM|EACCES)/i,
    suggestion: 'Verify file permissions and paths'
  },
  NetworkError: {
    pattern: /(ECONNREFUSED|ETIMEDOUT|ENOTFOUND)/i,
    suggestion: 'Check network connectivity and service availability'
  }
};

// Helper function to classify errors
const classifyError = (error) => {
  for (const [type, config] of Object.entries(errorTypes)) {
    if (config.pattern.test(error.name) || config.pattern.test(error.message)) {
      return {
        type,
        suggestion: config.suggestion
      };
    }
  }
  return {
    type: 'UnknownError',
    suggestion: 'Check application logs for more details'
  };
};

// Error logging function
const logError = (error, context = {}) => {
  const { type, suggestion } = classifyError(error);
  
  logger.error({
    message: error.message,
    type,
    context,
    stack: error.stack,
    suggestion,
    timestamp: new Date().toISOString()
  });
};

// HTTP request logging
const logHttpRequest = (req, res, next) => {
  logger.http({
    message: `${req.method} ${req.url}`,
    headers: req.headers,
    body: req.body,
    params: req.params,
    query: req.query,
    ip: req.ip
  });
  next();
};

module.exports = {
  logger,
  logError,
  logHttpRequest
}; 