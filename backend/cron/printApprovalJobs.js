const cron = require('node-cron');
const PrintApprovalService = require('../services/printApprovalService');

const initializePrintApprovalJobs = () => {
  // Check for print approvals every hour during business hours
  cron.schedule('0 9-17 * * 1-5', async () => {
    console.log('Checking for print approvals...');
    await PrintApprovalService.checkPrintApprovals();
  });
};

module.exports = initializePrintApprovalJobs; 