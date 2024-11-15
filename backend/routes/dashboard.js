const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const Brand = require('../models/Brand');
const Edition = require('../models/Edition');
const Task = require('../models/Task');
const User = require('../models/User');

// Get all dashboard data
router.get('/all', auth, checkRole(['super_admin']), async (req, res) => {
  try {
    const [brands, editions, tasks, users] = await Promise.all([
      Brand.find().lean(),
      Edition.find().populate('brand').lean(),
      Task.find().populate(['assignedTo', 'edition']).lean(),
      User.find().select('-password').lean()
    ]);

    // Department-specific metrics
    const salesMetrics = {
      totalClients: brands.length,
      activeEditions: editions.filter(e => e.status === 'active').length,
      pendingTasks: tasks.filter(t => t.department === 'Sales' && t.status === 'pending').length
    };

    const editorialMetrics = {
      totalArticles: tasks.filter(t => t.department === 'Editorial').length,
      inProgress: tasks.filter(t => t.department === 'Editorial' && t.status === 'in_progress').length,
      completed: tasks.filter(t => t.department === 'Editorial' && t.status === 'completed').length
    };

    const designMetrics = {
      totalDesigns: tasks.filter(t => t.department === 'Design').length,
      inReview: tasks.filter(t => t.department === 'Design' && t.status === 'in_review').length,
      approved: tasks.filter(t => t.department === 'Design' && t.status === 'approved').length
    };

    // Team metrics
    const teamMetrics = {
      totalUsers: users.length,
      byDepartment: {
        Sales: users.filter(u => u.department === 'Sales').length,
        Editorial: users.filter(u => u.department === 'Editorial').length,
        Design: users.filter(u => u.department === 'Design').length
      }
    };

    // Recent activity
    const recentTasks = await Task.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate(['assignedTo', 'edition'])
      .lean();

    res.status(200).json({
      overview: {
        totalBrands: brands.length,
        totalEditions: editions.length,
        totalTasks: tasks.length,
        totalUsers: users.length
      },
      departments: {
        sales: salesMetrics,
        editorial: editorialMetrics,
        design: designMetrics
      },
      team: teamMetrics,
      recentActivity: recentTasks,
      tasksByStatus: {
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        inReview: tasks.filter(t => t.status === 'in_review').length,
        completed: tasks.filter(t => t.status === 'completed').length
      }
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Get department-specific dashboard
router.get('/:department', auth, async (req, res) => {
  try {
    const { department } = req.params;
    const allowedDepartments = ['sales', 'editorial', 'design'];
    
    if (!allowedDepartments.includes(department.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid department' });
    }

    // Check if user has access to this department
    if (req.user.role !== 'super_admin' && 
        req.user.department.toLowerCase() !== department.toLowerCase()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ 
      department: department,
      deadline: { 
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
        $lte: new Date(new Date().setDate(new Date().getDate() + 60))  // Next 60 days
      }
    })
    .populate(['assignedTo', 'edition'])
    .sort({ deadline: 1 })
    .lean();

    const users = await User.find({ department: department })
      .select('-password')
      .lean();

    const metrics = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
      teamMembers: users.length
    };

    res.status(200).json({
      metrics,
      tasks,
      team: users,
      recentActivity: tasks.slice(0, 10)
    });
  } catch (error) {
    console.error(`${req.params.department} Dashboard Error:`, error);
    res.status(500).json({ message: 'Error fetching department dashboard data' });
  }
});

// Get task statistics
router.get('/stats/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find().lean();
    
    const stats = {
      total: tasks.length,
      byStatus: {
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        inReview: tasks.filter(t => t.status === 'in_review').length,
        completed: tasks.filter(t => t.status === 'completed').length
      },
      byDepartment: {
        Sales: tasks.filter(t => t.department === 'Sales').length,
        Editorial: tasks.filter(t => t.department === 'Editorial').length,
        Design: tasks.filter(t => t.department === 'Design').length
      }
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Task Stats Error:', error);
    res.status(500).json({ message: 'Error fetching task statistics' });
  }
});

// Get user performance metrics
router.get('/stats/users', auth, checkRole(['super_admin', 'super_manager']), async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    const tasks = await Task.find().populate('assignedTo').lean();

    const userMetrics = users.map(user => ({
      userId: user._id,
      name: user.name,
      department: user.department,
      metrics: {
        totalTasks: tasks.filter(t => t.assignedTo?._id.toString() === user._id.toString()).length,
        completedTasks: tasks.filter(t => 
          t.assignedTo?._id.toString() === user._id.toString() && 
          t.status === 'completed'
        ).length
      }
    }));

    res.status(200).json(userMetrics);
  } catch (error) {
    console.error('User Stats Error:', error);
    res.status(500).json({ message: 'Error fetching user statistics' });
  }
});

router.get('/admin/stats', auth, async (req, res) => {
  try {
    const brands = await Brand.countDocuments();
    const editions = await Edition.countDocuments();
    const tasks = await Task.find();
    
    const deadlines = await Task.find({
      deadline: { 
        $gte: new Date(), 
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
      }
    })
    .sort('deadline')
    .limit(6)
    .populate('assignedTo', 'name');

    res.json({
      brands,
      editions,
      tasks: {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length
      },
      deadlines: deadlines.map(d => ({
        taskName: d.name,
        date: d.deadline,
        assignee: d.assignedTo?.name
      }))
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

module.exports = router; 