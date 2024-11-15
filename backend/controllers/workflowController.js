const Task = require('../models/Task');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationUtils');
const socket = require('../config/socket');

const workflowController = {
  // Update task workflow status
  updateWorkflowStatus: async (req, res) => {
    try {
      const { taskId } = req.params;
      const { status, comment, files } = req.body;

      const task = await Task.findById(taskId)
        .populate('assignedTo', 'name email department')
        .populate('createdBy', 'name email department');

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Validate workflow transition
      const validTransitions = {
        pending: ['in_progress'],
        in_progress: ['review'],
        review: ['approved', 'changes_requested'],
        approved: ['completed', 'reopened'],
        changes_requested: ['in_progress'],
        completed: ['reopened'],
        reopened: ['in_progress']
      };

      if (!validTransitions[task.status]?.includes(status)) {
        return res.status(400).json({
          message: `Invalid status transition from ${task.status} to ${status}`
        });
      }

      // Update task status
      task.status = status;
      task.history.push({
        action: 'STATUS_CHANGED',
        user: req.user.id,
        details: `Status changed to ${status}`,
        comment: comment || ''
      });

      // Handle specific status transitions
      switch (status) {
        case 'in_progress':
          task.startedAt = new Date();
          break;

        case 'review':
          task.reviewRequestedAt = new Date();
          // Notify department manager
          await createNotification({
            type: 'REVIEW_REQUESTED',
            title: 'Review Requested',
            message: `Review requested for task: ${task.name}`,
            recipients: [task.assignedTo._id],
            data: { taskId: task._id }
          });
          break;

        case 'approved':
          task.approvedAt = new Date();
          // Notify task creator
          await createNotification({
            type: 'TASK_APPROVED',
            title: 'Task Approved',
            message: `Task approved: ${task.name}`,
            recipients: [task.createdBy._id],
            data: { taskId: task._id }
          });
          break;

        case 'changes_requested':
          // Notify assigned user
          await createNotification({
            type: 'CHANGES_REQUESTED',
            title: 'Changes Requested',
            message: `Changes requested for task: ${task.name}`,
            recipients: [task.assignedTo._id],
            data: { taskId: task._id }
          });
          break;

        case 'completed':
          task.completedAt = new Date();
          // Notify relevant users
          await createNotification({
            type: 'TASK_COMPLETED',
            title: 'Task Completed',
            message: `Task completed: ${task.name}`,
            recipients: [task.createdBy._id, task.assignedTo._id],
            data: { taskId: task._id }
          });
          break;

        case 'reopened':
          task.reopenedAt = new Date();
          task.completedAt = null;
          // Notify assigned user
          await createNotification({
            type: 'TASK_REOPENED',
            title: 'Task Reopened',
            message: `Task reopened: ${task.name}`,
            recipients: [task.assignedTo._id],
            data: { taskId: task._id }
          });
          break;
      }

      await task.save();

      // Emit socket event for real-time updates
      socket.getIO().to(`task_${taskId}`).emit('taskUpdated', {
        taskId,
        status,
        updatedBy: req.user.id
      });

      res.json(task);
    } catch (error) {
      console.error('Error updating workflow status:', error);
      res.status(500).json({ message: 'Error updating workflow status' });
    }
  },

  // Get task workflow history
  getWorkflowHistory: async (req, res) => {
    try {
      const { taskId } = req.params;
      const task = await Task.findById(taskId)
        .populate('history.user', 'name email department')
        .select('history');

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json(task.history);
    } catch (error) {
      console.error('Error fetching workflow history:', error);
      res.status(500).json({ message: 'Error fetching workflow history' });
    }
  },

  // Request task review
  requestReview: async (req, res) => {
    try {
      const { taskId } = req.params;
      const { reviewers, comment } = req.body;

      const task = await Task.findById(taskId)
        .populate('assignedTo', 'name email department');

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      task.status = 'review';
      task.reviewRequestedAt = new Date();
      task.history.push({
        action: 'REVIEW_REQUESTED',
        user: req.user.id,
        details: 'Review requested',
        comment
      });

      await task.save();

      // Notify reviewers
      await Promise.all(reviewers.map(reviewerId =>
        createNotification({
          type: 'REVIEW_REQUESTED',
          title: 'Review Requested',
          message: `Review requested for task: ${task.name}`,
          recipients: [reviewerId],
          data: { taskId: task._id }
        })
      ));

      // Emit socket event
      socket.getIO().to(`task_${taskId}`).emit('reviewRequested', {
        taskId,
        reviewers,
        requestedBy: req.user.id
      });

      res.json(task);
    } catch (error) {
      console.error('Error requesting review:', error);
      res.status(500).json({ message: 'Error requesting review' });
    }
  }
};

module.exports = workflowController; 