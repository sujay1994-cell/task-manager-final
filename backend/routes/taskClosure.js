const express = require('express');
const router = express.Router();
const taskClosureController = require('../controllers/taskClosureController');
const auth = require('../middleware/auth');
const { departmentCheck } = require('../middleware/roleCheck');

// Close task
router.post('/:id/close',
  auth,
  departmentCheck,
  taskClosureController.closeTask
);

// Reopen task
router.post('/:id/reopen',
  auth,
  departmentCheck,
  taskClosureController.reopenTask
);

// Get closure history
router.get('/:id/closure-history',
  auth,
  taskClosureController.getClosureHistory
);

module.exports = router; 