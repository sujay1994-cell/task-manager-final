const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const upload = require('../middleware/fileUpload');

// Create new task (Sales Manager only)
router.post('/',
  auth,
  checkRole(['sales_manager']),
  upload.array('files', 5),
  taskController.createTask
);

// Get all tasks (filtered by department/role)
router.get('/',
  auth,
  taskController.getTasks
);

// Get single task
router.get('/:taskId',
  auth,
  taskController.getTask
);

// Update task status
router.put('/:taskId/status',
  auth,
  checkRole(['sales_manager', 'editorial_manager', 'design_manager']),
  taskController.updateTaskStatus
);

// Assign task
router.put('/:taskId/assign',
  auth,
  checkRole(['sales_manager', 'editorial_manager', 'design_manager']),
  taskController.assignTask
);

// Upload files to task
router.post('/:taskId/files',
  auth,
  upload.array('files', 5),
  taskController.uploadFiles
);

// Get task history
router.get('/:taskId/history',
  auth,
  taskController.getTaskHistory
);

// Add comment to task
router.post('/:taskId/comments',
  auth,
  taskController.addComment
);

// Close task (Sales Manager only)
router.put('/:taskId/close',
  auth,
  checkRole(['sales_manager']),
  taskController.closeTask || ((req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
  })
);

// Reopen task (Sales Manager only)
router.put('/:taskId/reopen',
  auth,
  checkRole(['sales_manager']),
  taskController.reopenTask || ((req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
  })
);

// Get task files
router.get('/:taskId/files',
  auth,
  taskController.getTaskFiles || ((req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
  })
);

// Delete task file
router.delete('/:taskId/files/:fileId',
  auth,
  checkRole(['sales_manager', 'editorial_manager', 'design_manager']),
  taskController.deleteTaskFile || ((req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
  })
);

// Request magazine launch
router.post('/:taskId/request-launch',
  auth,
  checkRole(['sales_manager']),
  taskController.requestLaunch || ((req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
  })
);

// Mark magazine as launched
router.put('/:taskId/mark-launched',
  auth,
  checkRole(['editorial_manager']),
  taskController.markLaunched || ((req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
  })
);

// Generate print material
router.post('/:taskId/generate-print',
  auth,
  checkRole(['design_manager']),
  taskController.generatePrint || ((req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
  })
);

// Sign off edition
router.put('/:taskId/sign-off',
  auth,
  checkRole(['design_manager']),
  taskController.signOffEdition || ((req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
  })
);

module.exports = router; 