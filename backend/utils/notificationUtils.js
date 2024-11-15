const Notification = require('../models/Notification');
const User = require('../models/User');
const socket = require('../config/socket');

const notificationUtils = {
  async createNotification({
    type,
    title,
    message,
    recipients,
    data = {},
    urgent = false
  }) {
    try {
      // Get recipient users
      const users = await User.find({
        $or: [
          { _id: { $in: recipients } },
          { role: { $in: recipients } },
          { department: { $in: recipients } }
        ]
      });

      const notifications = [];
      const io = socket.getIO();

      // Create notifications for each recipient
      for (const user of users) {
        const notification = await Notification.create({
          type,
          title,
          message,
          recipient: user._id,
          data,
          urgent,
          createdAt: new Date()
        });

        notifications.push(notification);

        // Emit real-time notification
        io.to(`user_${user._id}`).emit('notification', {
          ...notification.toObject(),
          duration: urgent ? 8000 : 6000
        });

        // Special handling for specific notification types
        switch (type) {
          case 'TASK_OVERDUE':
            io.to(`user_${user._id}`).emit('taskOverdue', {
              taskId: data.taskId,
              taskName: data.taskName,
              deadline: data.deadline
            });
            break;

          case 'EDITION_COMPLETE':
            if (user.role === 'sales_manager') {
              io.to(`user_${user._id}`).emit('editionComplete', {
                editionId: data.editionId,
                editionName: data.editionName
              });
            }
            break;

          case 'PRINT_APPROVAL_REQUIRED':
            if (['sales_manager', 'editorial_manager'].includes(user.role)) {
              io.to(`user_${user._id}`).emit('printApprovalRequired', {
                editionId: data.editionId,
                editionName: data.editionName
              });
            }
            break;

          case 'REPRINT_TASK':
            if (user.department === 'design') {
              io.to(`user_${user._id}`).emit('reprintTask', {
                taskId: data.taskId,
                editionName: data.editionName
              });
            }
            break;
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { $set: { read: true, readAt: new Date() } },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async getUserNotifications(userId, options = {}) {
    try {
      const query = { recipient: userId };
      if (options.unreadOnly) {
        query.read = false;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 50);

      return notifications;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  },

  async deleteNotification(notificationId, userId) {
    try {
      await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};

module.exports = notificationUtils; 