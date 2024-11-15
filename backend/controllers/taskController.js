const Task = require('../models/Task');
const Notification = require('../models/Notification');

const taskController = {
  // Get all tasks
  getTasks: async (req, res) => {
    try {
      const { department, role } = req.user;
      let query = {};

      // Filter tasks based on user role and department
      if (!role.includes('manager')) {
        query.assignedTo = req.user.id;
      } else if (department !== 'admin') {
        query.department = department;
      }

      const tasks = await Task.find(query)
        .populate('brand', 'name')
        .populate('edition', 'name')
        .populate('assignedTo', 'name department')
        .populate('creator', 'name department')
        .sort({ createdAt: -1 });

      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create new task
  createTask: async (req, res) => {
    try {
      const { brand, edition, title, description, deadline } = req.body;
      const files = req.files ? req.files.map(file => ({
        filename: file.filename,
        path: file.path,
        originalname: file.originalname
      })) : [];

      const task = new Task({
        brand,
        edition,
        title,
        description,
        deadline,
        files,
        creator: req.user.id,
        department: req.user.department
      });

      await task.save();
      await task.populate('brand edition assignedTo creator');
      
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get single task
  getTask: async (req, res) => {
    try {
      const task = await Task.findById(req.params.taskId)
        .populate('brand', 'name')
        .populate('edition', 'name')
        .populate('assignedTo', 'name department')
        .populate('creator', 'name department');

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update task status
  updateTaskStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const task = await Task.findById(req.params.taskId);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      task.status = status;
      task.statusHistory.push({
        status,
        updatedBy: req.user.id,
        updatedAt: new Date()
      });

      await task.save();
      await task.populate('brand edition assignedTo creator');

      // Create notification
      await Notification.create({
        task: task._id,
        user: task.assignedTo,
        message: `Task status updated to ${status}`,
        type: 'STATUS_UPDATE'
      });

      res.json(task);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Assign task
  assignTask: async (req, res) => {
    try {
      const { assignedTo } = req.body;
      const task = await Task.findById(req.params.taskId);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      task.assignedTo = assignedTo;
      task.assignmentHistory.push({
        assignedTo,
        assignedBy: req.user.id,
        assignedAt: new Date()
      });

      await task.save();
      await task.populate('brand edition assignedTo creator');

      // Create notification
      await Notification.create({
        task: task._id,
        user: assignedTo,
        message: 'New task assigned to you',
        type: 'TASK_ASSIGNED'
      });

      res.json(task);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Upload files to task
  uploadFiles: async (req, res) => {
    try {
      const task = await Task.findById(req.params.taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const files = req.files.map(file => ({
        filename: file.filename,
        path: file.path,
        originalname: file.originalname,
        uploadedBy: req.user.id,
        uploadedAt: new Date()
      }));

      task.files.push(...files);
      await task.save();
      await task.populate('brand edition assignedTo creator');

      res.json(task);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get task history
  getTaskHistory: async (req, res) => {
    try {
      const task = await Task.findById(req.params.taskId)
        .populate('statusHistory.updatedBy', 'name')
        .populate('assignmentHistory.assignedTo assignmentHistory.assignedBy', 'name')
        .populate('files.uploadedBy', 'name');

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const history = {
        statusHistory: task.statusHistory,
        assignmentHistory: task.assignmentHistory,
        files: task.files
      };

      res.json(history);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Add comment to task
  addComment: async (req, res) => {
    try {
      const { content } = req.body;
      const task = await Task.findById(req.params.taskId);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      task.comments.push({
        content,
        user: req.user.id,
        createdAt: new Date()
      });

      await task.save();
      await task.populate('comments.user', 'name');

      res.json(task.comments);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  closeTask: async (req, res) => {
    try {
      const task = await Task.findById(req.params.taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      task.status = 'completed';
      task.completedAt = new Date();
      task.completedBy = req.user.id;

      await task.save();
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  reopenTask: async (req, res) => {
    try {
      const task = await Task.findById(req.params.taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      task.status = 'reopened';
      task.reopenedAt = new Date();
      task.reopenedBy = req.user.id;

      await task.save();
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getTaskFiles: async (req, res) => {
    try {
      const task = await Task.findById(req.params.taskId)
        .select('files')
        .populate('files.uploadedBy', 'name');
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json(task.files);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteTaskFile: async (req, res) => {
    try {
      const task = await Task.findById(req.params.taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const fileIndex = task.files.findIndex(
        file => file._id.toString() === req.params.fileId
      );

      if (fileIndex === -1) {
        return res.status(404).json({ message: 'File not found' });
      }

      task.files.splice(fileIndex, 1);
      await task.save();

      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  requestLaunch: async (req, res) => {
    try {
      const { launchDate } = req.body;
      const task = await Task.findById(req.params.taskId)
        .populate('edition')
        .populate('assignedTo');

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      task.launchRequested = true;
      task.launchDate = launchDate;
      task.launchRequestedBy = req.user.id;
      task.launchRequestedAt = new Date();

      await task.save();

      // Send notifications to relevant team members
      // This should be implemented in your notification system

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  markLaunched: async (req, res) => {
    try {
      const task = await Task.findById(req.params.taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      task.status = 'launched';
      task.launchedAt = new Date();
      task.launchedBy = req.user.id;

      await task.save();

      // Schedule reprint task after 48 hours (excluding weekends)
      // This should be implemented in your task scheduling system

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  generatePrint: async (req, res) => {
    try {
      const task = await Task.findById(req.params.taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      task.printGenerated = true;
      task.printGeneratedAt = new Date();
      task.printGeneratedBy = req.user.id;

      await task.save();
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  signOffEdition: async (req, res) => {
    try {
      const task = await Task.findById(req.params.taskId)
        .populate('edition');
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      task.status = 'signed_off';
      task.signedOffAt = new Date();
      task.signedOffBy = req.user.id;

      await task.save();

      // Update edition status if needed
      if (task.edition) {
        task.edition.status = 'completed';
        await task.edition.save();
      }

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = taskController; 