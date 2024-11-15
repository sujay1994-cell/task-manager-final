const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const {
  brandController,
  editionController,
  taskController,
  userController
} = require('../controllers');

// User Management Routes
router.get('/users',
  auth,
  rbac.checkPermission('view_all_users'),
  userController.getAllUsers
);

router.post('/users',
  auth,
  rbac.checkPermission('manage_users'),
  userController.createUser
);

router.get('/users/department/:department',
  auth,
  rbac.checkDepartmentAccess(),
  rbac.checkPermission('view_department_users'),
  userController.getDepartmentUsers
);

// Brand Management Routes
router.post('/brands',
  auth,
  rbac.checkRole('super_admin', 'super_manager'),
  brandController.create
);

router.put('/brands/:id',
  auth,
  rbac.checkRole('super_admin', 'super_manager'),
  rbac.checkResourceOwnership(Brand, 'id', 'manage_brands'),
  brandController.update
);

// Edition Management Routes
router.post('/editions',
  auth,
  rbac.checkPermission('create_editions'),
  editionController.create
);

router.put('/editions/:id',
  auth,
  rbac.checkPermission('manage_editions'),
  rbac.checkResourceOwnership(Edition, 'id', 'manage_all_editions'),
  editionController.update
);

// Task Management Routes
router.post('/tasks',
  auth,
  rbac.checkPermission('create_tasks'),
  taskController.create
);

router.get('/tasks/department/:department',
  auth,
  rbac.checkDepartmentAccess(),
  rbac.checkPermission('view_department_tasks'),
  taskController.getByDepartment
);

router.put('/tasks/:id/assign',
  auth,
  rbac.checkPermission('assign_tasks'),
  taskController.assignTask
);

router.put('/tasks/:id/status',
  auth,
  rbac.checkPermission('manage_department_tasks'),
  rbac.checkResourceOwnership(Task, 'id', 'manage_all_tasks'),
  taskController.updateStatus
);

module.exports = router; 