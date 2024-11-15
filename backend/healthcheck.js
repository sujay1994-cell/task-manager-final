const http = require('http');

const healthCheck = () => {
  return new Promise((resolve, reject) => {
    const options = {
      host: 'localhost',
      port: process.env.PORT || 5000,
      timeout: 2000,
      path: '/api/health'
    };

    const request = http.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        reject(new Error(`Health check failed: ${res.statusCode}`));
      }
    });

    request.on('error', (err) => {
      reject(err);
    });

    request.end();
  });
};

module.exports = healthCheck; 