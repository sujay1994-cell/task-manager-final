const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Get task by ID with full history
router.get('/tasks/search/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ taskId: req.params.taskId })
      .populate('brand', 'name')
      .populate('edition', 'name')
      .populate('assignedTo', 'name department')
      .populate('createdBy', 'name department')
      .populate('history.user', 'name department')
      .populate('comments.user', 'name department');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task' });
  }
});

// Get task history
router.get('/tasks/:taskId/history', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .select('history')
      .populate('history.user', 'name department')
      .populate('history.assignedTo', 'name department');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task.history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task history' });
  }
});

// Get task files with versions
router.get('/tasks/:taskId/files', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .select('files')
      .populate('files.uploadedBy', 'name department');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task.files);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task files' });
  }
});

// Download specific file version
router.get('/tasks/:taskId/files/:fileId/download', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const file = task.files.id(req.params.fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(file.path, file.originalName);
  } catch (error) {
    res.status(500).json({ message: 'Error downloading file' });
  }
});

// Advanced search with filters
router.get('/tasks/search', auth, async (req, res) => {
  try {
    const {
      query,
      brand,
      edition,
      type,
      status,
      department,
      assignedTo,
      dateFrom,
      dateTo,
      priority
    } = req.query;

    const searchQuery = {};

    // Text search across multiple fields
    if (query) {
      searchQuery.$or = [
        { taskId: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    // Add filters
    if (brand) searchQuery.brand = brand;
    if (edition) searchQuery.edition = edition;
    if (type) searchQuery.type = type;
    if (status) searchQuery.status = status;
    if (department) searchQuery.department = department;
    if (assignedTo) searchQuery.assignedTo = assignedTo;
    if (priority) searchQuery.priority = priority;

    // Date range filter
    if (dateFrom || dateTo) {
      searchQuery.createdAt = {};
      if (dateFrom) searchQuery.createdAt.$gte = new Date(dateFrom);
      if (dateTo) searchQuery.createdAt.$lte = new Date(dateTo);
    }

    // Role-based access control
    if (!checkPermission(req.user, 'canViewAllTasks')) {
      if (req.user.role.includes('manager')) {
        searchQuery.department = req.user.department;
      } else {
        searchQuery.assignedTo = req.user.id;
      }
    }

    const tasks = await Task.find(searchQuery)
      .populate('brand', 'name')
      .populate('edition', 'name')
      .populate('assignedTo', 'name department')
      .populate('createdBy', 'name department')
      .sort({ updatedAt: -1 })
      .limit(50);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error searching tasks' });
  }
});

// Get task statistics
router.get('/tasks/:taskId/stats', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const stats = {
      totalFiles: task.files.length,
      totalComments: task.comments.length,
      totalRevisions: task.history.filter(h => h.action === 'STATUS_UPDATED').length,
      timeSpent: task.completedAt ? 
        (new Date(task.completedAt) - new Date(task.createdAt)) / (1000 * 60 * 60) : // hours
        null,
      lastUpdated: task.updatedAt
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task statistics' });
  }
});

module.exports = router; 