const cron = require('node-cron');
const DeadlineMonitor = require('../services/deadlineMonitor');

// Run deadline checks
const initializeDeadlineJobs = () => {
  // Check approaching deadlines daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running approaching deadlines check...');
    await DeadlineMonitor.checkApproachingDeadlines();
  });

  // Check missed deadlines daily at 10 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('Running missed deadlines check...');
    await DeadlineMonitor.checkMissedDeadlines();
  });

  // Check overdue tasks every hour during work hours
  cron.schedule('0 9-17 * * 1-5', async () => {
    console.log('Running overdue tasks check...');
    await DeadlineMonitor.checkOverdueTasks();
  });
};

module.exports = initializeDeadlineJobs; 