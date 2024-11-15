const express = require('express');
const router = express.Router();
const editionController = require('../controllers/editionController');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const fileUpload = require('../middleware/fileUpload');

// Get all editions
router.get('/', auth, editionController.getAllEditions);

// Get single edition
router.get('/:id', auth, editionController.getEdition);

// Create edition
router.post('/',
  auth,
  roleCheck(['super_admin', 'super_manager', 'sales_manager']),
  fileUpload.single('coverImage'),
  editionController.createEdition
);

// Update edition
router.put('/:id',
  auth,
  roleCheck(['super_admin', 'super_manager', 'sales_manager']),
  fileUpload.single('coverImage'),
  editionController.updateEdition
);

// Delete edition
router.delete('/:id',
  auth,
  roleCheck(['super_admin']),
  editionController.deleteEdition
);

// Add approval
router.post('/:id/approvals',
  auth,
  roleCheck(['super_admin', 'super_manager', 'department_manager']),
  editionController.addApproval
);

module.exports = router; 