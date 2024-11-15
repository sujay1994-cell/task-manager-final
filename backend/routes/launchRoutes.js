const express = require('express');
const router = express.Router();
const launchController = require('../controllers/launchController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Request magazine launch (Sales Manager only)
router.post('/editions/:editionId/launch',
  auth,
  checkRole(['sales_manager']),
  launchController.requestLaunch
);

// Get launch status
router.get('/editions/:editionId/launch-status',
  auth,
  launchController.getLaunchStatus
);

// Request print approval
router.post('/editions/:editionId/print-approval',
  auth,
  checkRole(['sales_manager', 'editorial_manager']),
  launchController.requestPrintApproval
);

// Approve print request
router.post('/editions/:editionId/approve-print',
  auth,
  checkRole(['sales_manager', 'editorial_manager']),
  launchController.approvePrint
);

// Sign off edition
router.post('/editions/:editionId/sign-off',
  auth,
  checkRole(['sales_manager']),
  launchController.signOffEdition
);

// Get automated tasks status
router.get('/editions/:editionId/automated-tasks',
  auth,
  launchController.getAutomatedTasksStatus
);

module.exports = router; 