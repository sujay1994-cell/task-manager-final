const Notification = require('../models/Notification');
const User = require('../models/User');
const { io } = require('../config/socket');

exports.createNotification = async (data) => {
  try {
    const {
      recipientId,
      type,
      title,
      message,
      taskId,
      editionId,
      brandId
    } = data;

    const notification = new Notification({
      recipient: recipientId,
      type,
      title,
      message,
      taskId,
      editionId,
      brandId
    });

    await notification.save();

    // Emit real-time notification
    io.to(recipientId.toString()).emit('newNotification', notification);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('taskId', 'title')
      .populate('editionId', 'name')
      .populate('brandId', 'name');

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user.id
      },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Utility function to notify department members
exports.notifyDepartment = async (departmentId, notificationData) => {
  try {
    const users = await User.find({ department: departmentId });
    
    const notifications = users.map(user => ({
      ...notificationData,
      recipientId: user._id
    }));

    await Promise.all(notifications.map(notification => 
      exports.createNotification(notification)
    ));
  } catch (error) {
    console.error('Error notifying department:', error);
    throw error;
  }
};

// Utility function to notify task participants
exports.notifyTaskParticipants = async (taskId, notificationData, excludeUserId = null) => {
  try {
    const task = await Task.findById(taskId)
      .populate('assignedTo')
      .populate('createdBy');

    const participants = new Set([
      task.assignedTo._id.toString(),
      task.createdBy._id.toString()
    ]);

    // Remove excluded user if specified
    if (excludeUserId) {
      participants.delete(excludeUserId.toString());
    }

    await Promise.all([...participants].map(userId =>
      exports.createNotification({
        ...notificationData,
        recipientId: userId
      })
    ));
  } catch (error) {
    console.error('Error notifying task participants:', error);
    throw error;
  }
}; 