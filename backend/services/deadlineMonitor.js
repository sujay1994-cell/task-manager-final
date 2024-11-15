const Task = require('../models/Task');
const User = require('../models/User');
const { createNotification } = require('../controllers/notificationController');

const DeadlineMonitor = {
  // Check for approaching deadlines (runs daily)
  checkApproachingDeadlines: async () => {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const tasks = await Task.find({
      deadline: {
        $gte: new Date(),
        $lte: threeDaysFromNow
      },
      status: { $nin: ['completed'] }
    }).populate('assignedTo department');

    for (const task of tasks) {
      // Notify assigned team member
      if (task.assignedTo) {
        await createNotification({
          recipient: task.assignedTo._id,
          type: 'deadline_approaching',
          task: task._id,
          urgency: 'medium'
        });
      }

      // Notify department manager
      const manager = await User.findOne({
        department: task.department,
        role: 'manager'
      });

      if (manager) {
        await createNotification({
          recipient: manager._id,
          type: 'deadline_approaching',
          task: task._id,
          urgency: 'medium'
        });
      }
    }
  },

  // Check for missed deadlines (runs daily)
  checkMissedDeadlines: async () => {
    const tasks = await Task.find({
      deadline: { $lt: new Date() },
      status: { $nin: ['completed'] }
    }).populate('assignedTo department');

    for (const task of tasks) {
      // Notify assigned team member
      if (task.assignedTo) {
        await createNotification({
          recipient: task.assignedTo._id,
          type: 'deadline_missed',
          task: task._id,
          urgency: 'high'
        });
      }

      // Notify department manager
      const manager = await User.findOne({
        department: task.department,
        role: 'manager'
      });

      if (manager) {
        await createNotification({
          recipient: manager._id,
          type: 'deadline_missed',
          task: task._id,
          urgency: 'critical'
        });
      }
    }
  },

  // Check for overdue tasks (runs hourly)
  checkOverdueTasks: async () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const tasks = await Task.find({
      deadline: { $lt: twoDaysAgo },
      status: { $nin: ['completed'] }
    }).populate('assignedTo department');

    for (const task of tasks) {
      // Notify department manager and admin
      const managers = await User.find({
        $or: [
          { department: task.department, role: 'manager' },
          { role: 'admin' }
        ]
      });

      for (const manager of managers) {
        await createNotification({
          recipient: manager._id,
          type: 'task_overdue',
          task: task._id,
          urgency: 'critical'
        });
      }
    }
  }
};

module.exports = DeadlineMonitor; 