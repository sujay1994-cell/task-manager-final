const Task = require('../models/Task');
const { sendNotification } = require('../services/notificationService');

const taskClosureController = {
  // Close task
  closeTask: async (req, res) => {
    try {
      const { clientApproval } = req.body;
      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Verify user is from Sales department
      if (req.user.department !== 'Sales') {
        return res.status(403).json({
          message: 'Only Sales department can close tasks'
        });
      }

      await task.closeTask(req.user.id, clientApproval);

      // Notify relevant users
      const notifyUsers = [task.createdBy, task.assignedTo];
      await Promise.all(notifyUsers.map(userId =>
        sendNotification(userId, {
          type: 'task_closed',
          message: `Task "${task.name}" has been closed`,
          taskId: task._id,
          priority: 'high'
        })
      ));

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Error closing task' });
    }
  },

  // Reopen task
  reopenTask: async (req, res) => {
    try {
      const { reason } = req.body;
      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Verify user is from Sales department
      if (req.user.department !== 'Sales') {
        return res.status(403).json({
          message: 'Only Sales department can reopen tasks'
        });
      }

      await task.reopenTask(req.user.id, reason);

      // Notify relevant users
      const notifyUsers = [task.createdBy, task.assignedTo];
      await Promise.all(notifyUsers.map(userId =>
        sendNotification(userId, {
          type: 'task_reopened',
          message: `Task "${task.name}" has been reopened: ${reason}`,
          taskId: task._id,
          priority: 'high'
        })
      ));

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Error reopening task' });
    }
  },

  // Get closure history
  getClosureHistory: async (req, res) => {
    try {
      const task = await Task.findById(req.params.id)
        .populate('closure.closedBy', 'name email')
        .populate('closure.reopenHistory.reopenedBy', 'name email');

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json({
        isClosed: task.closure.isClosed,
        closureInfo: task.closure,
        reopenHistory: task.closure.reopenHistory
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching closure history' });
    }
  }
};

module.exports = taskClosureController; 