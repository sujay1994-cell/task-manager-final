const cron = require('node-cron');
const ReprintMonitor = require('../services/reprintMonitor');

const initializeReprintJobs = () => {
  // Check for reprint notifications every hour during business hours
  cron.schedule('0 9-17 * * 1-5', async () => {
    console.log('Checking for reprint notifications...');
    await ReprintMonitor.checkReprintNotifications();
  });
};

module.exports = initializeReprintJobs; 