const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Edition = require('../models/Edition');
const LaunchEvent = require('../models/LaunchEvent');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const { getWorkingDayOffset } = require('../utils/dateUtils');

// Get tasks for calendar
router.get('/calendar/tasks', auth, async (req, res) => {
  try {
    const { department, role } = req.query;
    let query = {};

    // Role-based filtering
    if (role.includes('manager')) {
      query.department = department;
    } else {
      query.assignedTo = req.user.id;
    }

    // Get tasks with deadlines
    const tasks = await Task.find({
      ...query,
      deadline: { $exists: true }
    })
    .populate('brand', 'name')
    .populate('edition', 'name')
    .populate('assignedTo', 'name department')
    .sort({ deadline: 1 });

    // Add overdue status
    const tasksWithStatus = tasks.map(task => {
      const taskObj = task.toObject();
      if (new Date(task.deadline) < new Date() && task.status !== 'completed') {
        taskObj.status = 'overdue';
      }
      return taskObj;
    });

    res.json(tasksWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching calendar tasks' });
  }
});

// Get launch events
router.get('/calendar/launch-events', auth, async (req, res) => {
  try {
    const { department } = req.query;
    
    // Get editions with launch dates
    const editions = await Edition.find({
      'launchStatus.launchDate': { $exists: true },
      $or: [
        { department },
        { 'launchStatus.notifyDepartments': department }
      ]
    })
    .populate('brand', 'name');

    // Generate all related events
    const events = [];
    
    for (const edition of editions) {
      const launchDate = new Date(edition.launchStatus.launchDate);
      
      // Magazine launch event
      events.push({
        title: `Launch: ${edition.brand.name} - ${edition.name}`,
        date: launchDate,
        edition: edition._id,
        details: edition.launchStatus.notes || ''
      });

      // Reprint preparation event
      if (department === 'design') {
        events.push({
          title: `Prepare Reprints: ${edition.brand.name} - ${edition.name}`,
          date: getWorkingDayOffset(launchDate, 2),
          edition: edition._id,
          details: 'Prepare reprint materials'
        });

        // Marketing materials event
        events.push({
          title: `Marketing Materials: ${edition.brand.name} - ${edition.name}`,
          date: getWorkingDayOffset(launchDate, 3),
          edition: edition._id,
          details: 'Prepare marketing materials'
        });
      }
    }

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching launch events' });
  }
});

// Create calendar event
router.post('/calendar/events', auth, checkRole(['manager']), async (req, res) => {
  try {
    const event = await LaunchEvent.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating calendar event' });
  }
});

module.exports = router; 