const Task = require('../models/Task');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationUtils');
const socket = require('../config/socket');

const departmentController = {
  // Sales Dashboard
  getSalesDashboard: async (req, res) => {
    try {
      const stats = await Task.aggregate([
        {
          $match: {
            department: 'sales',
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30))
            }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const pendingApprovals = await Task.find({
        department: 'sales',
        status: 'review_required'
      }).populate('brand edition assignedTo');

      const recentTasks = await Task.find({
        department: 'sales'
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('brand edition assignedTo');

      res.json({
        stats,
        pendingApprovals,
        recentTasks
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching sales dashboard' });
    }
  },

  // Editorial Dashboard
  getEditorialDashboard: async (req, res) => {
    try {
      const assignedTasks = await Task.find({
        department: 'editorial',
        status: { $nin: ['completed', 'cancelled'] }
      }).populate('brand edition assignedTo');

      const teamWorkload = await User.aggregate([
        {
          $match: { department: 'editorial' }
        },
        {
          $lookup: {
            from: 'tasks',
            localField: '_id',
            foreignField: 'assignedTo',
            as: 'tasks'
          }
        },
        {
          $project: {
            name: 1,
            activeTasks: {
              $size: {
                $filter: {
                  input: '$tasks',
                  as: 'task',
                  cond: { $ne: ['$$task.status', 'completed'] }
                }
              }
            }
          }
        }
      ]);

      res.json({
        assignedTasks,
        teamWorkload
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching editorial dashboard' });
    }
  },

  // Design Dashboard
  getDesignDashboard: async (req, res) => {
    try {
      const activeDesigns = await Task.find({
        department: 'design',
        status: { $nin: ['completed', 'cancelled'] }
      }).populate('brand edition assignedTo');

      const pendingReviews = await Task.find({
        department: 'design',
        status: 'review_required'
      }).populate('brand edition assignedTo');

      res.json({
        activeDesigns,
        pendingReviews
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching design dashboard' });
    }
  },

  // Department Tasks
  getDepartmentTasks: async (req, res) => {
    try {
      const { department } = req.params;
      const { status, priority, assignedTo } = req.query;

      const query = { department };
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (assignedTo) query.assignedTo = assignedTo;

      const tasks = await Task.find(query)
        .populate('brand edition assignedTo')
        .sort({ updatedAt: -1 });

      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching department tasks' });
    }
  },

  // Department Stats
  getDepartmentStats: async (req, res) => {
    try {
      const { department } = req.params;

      const stats = await Task.aggregate([
        {
          $match: { department }
        },
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            completedTasks: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            overdueTasks: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $lt: ['$deadline', new Date()] },
                      { $ne: ['$status', 'completed'] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      res.json(stats[0] || {
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching department stats' });
    }
  },

  // Department Team
  getDepartmentTeam: async (req, res) => {
    try {
      const { department } = req.params;
      const team = await User.find({ department })
        .select('-password')
        .sort({ role: 1, name: 1 });

      res.json(team);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching department team' });
    }
  },

  // Add Task Comment
  addTaskComment: async (req, res) => {
    try {
      const { taskId } = req.params;
      const { content } = req.body;

      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      task.comments.push({
        content,
        user: req.user.id,
        department: req.user.department
      });

      await task.save();

      // Notify relevant users
      await createNotification({
        type: 'TASK_COMMENT',
        title: 'New Comment',
        message: `New comment on task: ${task.name}`,
        recipients: [task.assignedTo, task.createdBy],
        data: { taskId: task._id }
      });

      // Emit socket event
      socket.getIO().to(`task_${taskId}`).emit('newComment', {
        taskId,
        comment: task.comments[task.comments.length - 1]
      });

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Error adding comment' });
    }
  }
};

module.exports = departmentController; 