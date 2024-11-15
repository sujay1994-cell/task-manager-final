const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get task comments
router.get('/tasks/:taskId/comments', auth, commentController.getTaskComments);

// Create comment
router.post(
  '/tasks/:taskId/comments',
  auth,
  upload.array('attachments', 5),
  commentController.createComment
);

// Update comment
router.put(
  '/tasks/:taskId/comments/:commentId',
  auth,
  commentController.updateComment
);

// Delete comment
router.delete(
  '/tasks/:taskId/comments/:commentId',
  auth,
  commentController.deleteComment
);

module.exports = router; 