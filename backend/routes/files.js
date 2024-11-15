const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const auth = require('../middleware/auth');

router.post('/upload', auth, fileController.uploadFiles);
router.get('/versions/:taskId', auth, fileController.getFileVersions);
router.get('/download/:fileId', auth, fileController.downloadFile);
router.delete('/:fileId', auth, fileController.deleteFile);

module.exports = router; 