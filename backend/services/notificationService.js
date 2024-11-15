const Notification = require('../models/Notification');
const User = require('../models/User');
const emailService = require('./emailService');
const websocketService = require('./websocketService');

class NotificationService {
  constructor(wsService) {
    this.wsService = wsService;
  }

  async createNotification(data) {
    try {
      const notification = new Notification({
        recipient: data.recipient,
        type: data.type,
        title: data.title,
        message: data.message,
        relatedTask: data.taskId,
        relatedFile: data.fileId,
        priority: data.priority,
        createdBy: data.createdBy
      });

      await notification.save();

      // Send real-time notification
      this.wsService.sendToUser(data.recipient, {
        type: 'new_notification',
        notification
      });

      // Send email for high priority notifications
      if (data.priority === 'high' || data.priority === 'urgent') {
        const recipient = await User.findById(data.recipient);
        await emailService.sendNotificationEmail(recipient.email, data);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getUnreadNotifications(userId) {
    return Notification.find({
      recipient: userId,
      read: false
    })
    .sort('-createdAt')
    .populate('relatedTask')
    .populate('createdBy', 'name email');
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true },
      { new: true }
    );
    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );
  }

  async deleteNotification(notificationId, userId) {
    await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });
  }

  // Activity feed methods
  async getActivityFeed(departmentOrUserId, type = 'user') {
    const query = type === 'department' 
      ? { 'relatedTask.department': departmentOrUserId }
      : { recipient: departmentOrUserId };

    return Notification.find(query)
      .sort('-createdAt')
      .limit(50)
      .populate('relatedTask')
      .populate('createdBy', 'name email');
  }

  // Specialized notification methods
  async notifyTaskAssignment(taskId, assigneeId, assignerId) {
    await this.createNotification({
      recipient: assigneeId,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned a new task`,
      taskId,
      priority: 'high',
      createdBy: assignerId
    });
  }

  async notifyFileUpload(taskId, fileId, uploaderId, recipientIds) {
    await Promise.all(recipientIds.map(recipientId =>
      this.createNotification({
        recipient: recipientId,
        type: 'file_uploaded',
        title: 'New File Uploaded',
        message: 'A new file has been uploaded to your task',
        taskId,
        fileId,
        priority: 'normal',
        createdBy: uploaderId
      })
    ));
  }

  async notifyReviewRequest(taskId, requesterId, reviewerIds) {
    await Promise.all(reviewerIds.map(reviewerId =>
      this.createNotification({
        recipient: reviewerId,
        type: 'review_requested',
        title: 'Review Requested',
        message: 'Your review has been requested on a task',
        taskId,
        priority: 'high',
        createdBy: requesterId
      })
    ));
  }

  async notifyDeadlineApproaching(taskId, recipientIds) {
    await Promise.all(recipientIds.map(recipientId =>
      this.createNotification({
        recipient: recipientId,
        type: 'deadline_approaching',
        title: 'Deadline Approaching',
        message: 'Task deadline is approaching',
        taskId,
        priority: 'urgent',
        createdBy: null
      })
    ));
  }
}

module.exports = NotificationService; 