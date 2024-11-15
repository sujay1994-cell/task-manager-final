const { WORKFLOW_STEPS, DEPARTMENT_WORKFLOWS } = require('../config/workflowConfig');
const { sendNotification } = require('./notificationService');

class WorkflowService {
  static async updateTaskStatus(task, newStatus, userId) {
    const oldStatus = task.status;
    task.status = newStatus;
    
    // Add to history
    task.history.push({
      action: 'status_changed',
      user: userId,
      details: `Status changed from ${oldStatus} to ${newStatus}`,
      timestamp: new Date()
    });

    // Send notifications
    await this.sendStatusChangeNotifications(task, oldStatus, newStatus);

    return task.save();
  }

  static async validateStatusChange(task, newStatus, userRole) {
    const workflow = DEPARTMENT_WORKFLOWS[task.department];
    const currentStep = workflow.steps.find(s => s.step.id === task.status);
    const nextStep = workflow.steps.find(s => s.step.id === newStatus);

    // Check if status change is allowed
    if (!currentStep.step.nextSteps.includes(newStatus)) {
      throw new Error('Invalid status transition');
    }

    // Check if user has permission
    if (!nextStep.requiredRole.includes(userRole)) {
      throw new Error('User not authorized for this status change');
    }

    return true;
  }

  static async sendStatusChangeNotifications(task, oldStatus, newStatus) {
    const notifications = [];

    // Notify task owner
    notifications.push({
      userId: task.createdBy,
      type: 'status_change',
      message: `Task "${task.name}" status changed from ${oldStatus} to ${newStatus}`,
      taskId: task._id
    });

    // Notify assigned user if exists
    if (task.assignedTo) {
      notifications.push({
        userId: task.assignedTo,
        type: 'status_change',
        message: `Task "${task.name}" status changed from ${oldStatus} to ${newStatus}`,
        taskId: task._id
      });
    }

    // Send all notifications
    await Promise.all(notifications.map(notification => 
      sendNotification(notification.userId, notification)
    ));
  }

  static async reassignTask(task, newAssigneeId, userId) {
    const oldAssigneeId = task.assignedTo;
    task.assignedTo = newAssigneeId;

    // Add to history
    task.history.push({
      action: 'reassigned',
      user: userId,
      details: `Task reassigned to user ${newAssigneeId}`,
      timestamp: new Date()
    });

    // Notify old assignee
    if (oldAssigneeId) {
      await sendNotification(oldAssigneeId, {
        type: 'task_unassigned',
        message: `You have been unassigned from task "${task.name}"`,
        taskId: task._id
      });
    }

    // Notify new assignee
    await sendNotification(newAssigneeId, {
      type: 'task_assigned',
      message: `You have been assigned to task "${task.name}"`,
      taskId: task._id
    });

    return task.save();
  }

  static async requestReview(task, userId, reviewDetails) {
    await this.updateTaskStatus(task, WORKFLOW_STEPS.REVIEW_REQUESTED.id, userId);

    // Add review request to history
    task.history.push({
      action: 'review_requested',
      user: userId,
      details: reviewDetails,
      timestamp: new Date()
    });

    // Notify relevant users
    const notifyUsers = [task.createdBy];
    if (task.assignedTo && task.assignedTo.toString() !== userId) {
      notifyUsers.push(task.assignedTo);
    }

    await Promise.all(notifyUsers.map(userId =>
      sendNotification(userId, {
        type: 'review_requested',
        message: `Review requested for task "${task.name}"`,
        taskId: task._id
      })
    ));

    return task.save();
  }

  static async submitFeedback(task, userId, feedback) {
    // Add feedback to history
    task.history.push({
      action: 'feedback_added',
      user: userId,
      details: feedback,
      timestamp: new Date()
    });

    // If revision needed, update status
    if (feedback.requiresRevision) {
      await this.updateTaskStatus(task, WORKFLOW_STEPS.REVISION_NEEDED.id, userId);
    }

    // Notify task owner and assignee
    const notifyUsers = [task.createdBy];
    if (task.assignedTo && task.assignedTo.toString() !== userId) {
      notifyUsers.push(task.assignedTo);
    }

    await Promise.all(notifyUsers.map(userId =>
      sendNotification(userId, {
        type: 'feedback_added',
        message: `New feedback added for task "${task.name}"`,
        taskId: task._id
      })
    ));

    return task.save();
  }

  static async completeTask(task, userId) {
    await this.updateTaskStatus(task, WORKFLOW_STEPS.COMPLETED.id, userId);

    // Add completion to history
    task.history.push({
      action: 'completed',
      user: userId,
      details: 'Task marked as completed',
      timestamp: new Date()
    });

    // Notify relevant users
    const notifyUsers = [task.createdBy];
    if (task.assignedTo && task.assignedTo.toString() !== userId) {
      notifyUsers.push(task.assignedTo);
    }

    await Promise.all(notifyUsers.map(userId =>
      sendNotification(userId, {
        type: 'task_completed',
        message: `Task "${task.name}" has been completed`,
        taskId: task._id
      })
    ));

    return task.save();
  }
}

module.exports = WorkflowService; 