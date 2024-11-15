const monitoringService = require('../services/monitoringService');

const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  // Add response listener
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Track API performance
    monitoringService.trackAPICall(
      `${req.method} ${req.route.path}`,
      duration,
      res.statusCode
    );

    // Log slow requests
    if (duration > 1000) {
      monitoringService.logEvent('warn', 'Slow API request', {
        path: req.path,
        method: req.method,
        duration,
        userId: req.user?.id
      });
    }
  });

  next();
};

module.exports = performanceMonitor; 