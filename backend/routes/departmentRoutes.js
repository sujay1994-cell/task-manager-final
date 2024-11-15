const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Sales Department Routes
router.get('/sales/dashboard',
  auth,
  checkRole(['sales_manager', 'sales_team']),
  departmentController.getSalesDashboard
);

router.post('/sales/tasks',
  auth,
  checkRole(['sales_manager']),
  departmentController.createSalesTask
);

router.put('/sales/tasks/:taskId/approve',
  auth,
  checkRole(['sales_manager']),
  departmentController.approveSalesTask
);

// Editorial Department Routes
router.get('/editorial/dashboard',
  auth,
  checkRole(['editorial_manager', 'editorial_team']),
  departmentController.getEditorialDashboard
);

router.put('/editorial/tasks/:taskId/assign',
  auth,
  checkRole(['editorial_manager']),
  departmentController.assignEditorialTask
);

router.put('/editorial/tasks/:taskId/review',
  auth,
  checkRole(['editorial_manager']),
  departmentController.reviewEditorialTask
);

// Design Department Routes
router.get('/design/dashboard',
  auth,
  checkRole(['design_manager', 'design_team']),
  departmentController.getDesignDashboard
);

router.put('/design/tasks/:taskId/upload',
  auth,
  checkRole(['design_manager', 'design_team']),
  departmentController.uploadDesignFiles
);

router.put('/design/tasks/:taskId/request-review',
  auth,
  checkRole(['design_manager', 'design_team']),
  departmentController.requestDesignReview
);

// Common Department Routes
router.get('/:department/tasks',
  auth,
  departmentController.getDepartmentTasks
);

router.get('/:department/stats',
  auth,
  departmentController.getDepartmentStats
);

router.get('/:department/team',
  auth,
  departmentController.getDepartmentTeam
);

router.post('/:department/tasks/:taskId/comment',
  auth,
  departmentController.addTaskComment
);

module.exports = router; 