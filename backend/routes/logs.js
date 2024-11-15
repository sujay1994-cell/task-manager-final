const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');

router.post('/frontend', (req, res) => {
  const { error, errorInfo, location, timestamp, userAgent } = req.body;

  logger.error({
    message: 'Frontend Error',
    error,
    errorInfo,
    location,
    timestamp,
    userAgent
  });

  res.status(200).send('Error logged');
});

module.exports = router; 