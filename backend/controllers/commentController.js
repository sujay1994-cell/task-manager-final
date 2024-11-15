const Comment = require('../models/Comment');
const Task = require('../models/Task');
const { uploadToCloudinary } = require('../utils/fileUpload');
const { sendNotification } = require('../utils/notificationUtils');

exports.getTaskComments = async (req, res) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId })
      .sort({ createdAt: -1 })
      .populate('user', 'name avatar')
      .populate('mentions', 'name')
      .lean();

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content, mentions } = req.body;
    const files = req.files;

    // Upload attachments if any
    const attachments = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResult = await uploadToCloudinary(file);
        attachments.push({
          filename: file.originalname,
          url: uploadResult.url,
          fileType: file.mimetype,
          fileSize: file.size
        });
      }
    }

    const comment = new Comment({
      taskId,
      user: req.user.id,
      content,
      attachments,
      mentions
    });

    await comment.save();

    // Populate user data before sending response
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name avatar')
      .populate('mentions', 'name');

    // Notify mentioned users
    if (mentions && mentions.length > 0) {
      await Promise.all(mentions.map(userId =>
        sendNotification({
          recipientId: userId,
          type: 'mention',
          title: 'You were mentioned in a comment',
          message: `${req.user.name} mentioned you in a comment`,
          taskId
        })
      ));
    }

    // Notify task participants
    const task = await Task.findById(taskId)
      .populate('assignedTo')
      .populate('createdBy');

    const notifyUsers = new Set([
      task.assignedTo._id.toString(),
      task.createdBy._id.toString()
    ]);
    notifyUsers.delete(req.user.id); // Don't notify the comment author

    await Promise.all([...notifyUsers].map(userId =>
      sendNotification({
        recipientId: userId,
        type: 'comment',
        title: 'New comment on task',
        message: `${req.user.name} commented on a task`,
        taskId
      })
    ));

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.commentId,
      user: req.user.id
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    comment.content = req.body.content;
    comment.isEdited = true;
    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate('user', 'name avatar')
      .populate('mentions', 'name');

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.commentId,
      user: req.user.id
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    await comment.remove();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 