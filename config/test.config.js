const config = {
  api: {
    baseUrl: process.env.TEST_API_URL || 'http://localhost:5000',
    timeout: 10000
  },
  frontend: {
    baseUrl: process.env.TEST_FRONTEND_URL || 'http://localhost:3000',
    timeout: 30000
  },
  db: {
    uri: process.env.TEST_DB_URI || 'mongodb://localhost:27017/magazine_test'
  },
  auth: {
    jwtSecret: process.env.TEST_JWT_SECRET || 'test_secret'
  },
  logging: {
    level: process.env.TEST_LOG_LEVEL || 'info',
    file: 'logs/test.log'
  }
};

module.exports = config; 