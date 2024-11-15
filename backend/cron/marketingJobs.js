const cron = require('node-cron');
const MarketingFollowUp = require('../services/marketingFollowUp');

const initializeMarketingJobs = () => {
  // Check for marketing tasks every hour during business hours
  cron.schedule('0 9-17 * * 1-5', async () => {
    console.log('Checking for marketing task creation...');
    await MarketingFollowUp.checkMarketingTasks();
  });
};

module.exports = initializeMarketingJobs; 