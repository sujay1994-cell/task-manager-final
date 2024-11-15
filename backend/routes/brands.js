const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const fileUpload = require('../middleware/fileUpload');
const { ROLES } = require('../utils/roles');

// Get all brands
router.get('/', auth, brandController.getAllBrands);

// Get single brand
router.get('/:id', auth, brandController.getBrand);

// Create brand
router.post('/',
  auth,
  roleCheck([ROLES.SUPER_ADMIN, ROLES.SUPER_MANAGER]),
  fileUpload.single('logo'),
  brandController.createBrand
);

// Update brand
router.put('/:id',
  auth,
  roleCheck([ROLES.SUPER_ADMIN, ROLES.SUPER_MANAGER]),
  fileUpload.single('logo'),
  brandController.updateBrand
);

// Delete brand
router.delete('/:id',
  auth,
  roleCheck([ROLES.SUPER_ADMIN]),
  brandController.deleteBrand
);

// Get brand editions
router.get('/:id/editions',
  auth,
  brandController.getBrandEditions
);

module.exports = router; 