const express = require('express');
const router = express.Router();
const editionController = require('../controllers/editionController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

router.get('/', auth, editionController.getEditions);

router.post('/', 
  auth, 
  checkRole(['manager', 'sales']), 
  editionController.createEdition
);

router.get('/:id', auth, editionController.getEdition);

router.put('/:id', 
  auth, 
  checkRole(['manager', 'sales']), 
  editionController.updateEdition
);

router.delete('/:id', 
  auth, 
  checkRole(['manager']), 
  editionController.deleteEdition
);

module.exports = router; 