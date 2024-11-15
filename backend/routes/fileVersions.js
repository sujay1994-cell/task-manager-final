const express = require('express');
const router = express.Router();
const fileVersionController = require('../controllers/fileVersionController');
const auth = require('../middleware/auth');
const upload = require('../middleware/fileUpload');

// Upload new version
router.post('/:taskId/upload',
  auth,
  upload.array('files'),
  fileVersionController.uploadVersion
);

// Get versions
router.get('/:taskId/versions',
  auth,
  fileVersionController.getVersions
);

// Add comment
router.post('/:versionId/comments',
  auth,
  fileVersionController.addComment
);

// Download version
router.get('/:versionId/download',
  auth,
  fileVersionController.downloadVersion
);

// Archive version
router.put('/:versionId/archive',
  auth,
  fileVersionController.archiveVersion
);

module.exports = router; 