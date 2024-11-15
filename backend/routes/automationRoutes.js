const express = require('express');
const router = express.Router();
const AutomatedTaskTracker = require('../components/AutomatedTaskTracker');
const LaunchWorkflow = require('../components/LaunchWorkflow');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Get automation status for edition
router.get('/editions/:editionId/automation-status',
  auth,
  async (req, res) => {
    try {
      const status = await AutomatedTaskTracker.getEditionStatus(req.params.editionId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching automation status' });
    }
  }
);

// Start automated task sequence
router.post('/editions/:editionId/start-automation',
  auth,
  checkRole(['sales_manager']),
  async (req, res) => {
    try {
      const result = await AutomatedTaskTracker.trackEdition(req.params.editionId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error starting automation' });
    }
  }
);

// Pause automated task sequence
router.post('/editions/:editionId/pause-automation',
  auth,
  checkRole(['sales_manager']),
  async (req, res) => {
    try {
      const result = await AutomatedTaskTracker.pauseTracking(req.params.editionId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error pausing automation' });
    }
  }
);

// Resume automated task sequence
router.post('/editions/:editionId/resume-automation',
  auth,
  checkRole(['sales_manager']),
  async (req, res) => {
    try {
      const result = await AutomatedTaskTracker.resumeTracking(req.params.editionId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error resuming automation' });
    }
  }
);

// Get automated task history
router.get('/editions/:editionId/automation-history',
  auth,
  async (req, res) => {
    try {
      const history = await AutomatedTaskTracker.getTaskHistory(req.params.editionId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching automation history' });
    }
  }
);

// Override automated task schedule
router.post('/tasks/:taskId/override-schedule',
  auth,
  checkRole(['sales_manager']),
  async (req, res) => {
    try {
      const result = await AutomatedTaskTracker.overrideTaskSchedule(
        req.params.taskId,
        req.body.newSchedule
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error overriding task schedule' });
    }
  }
);

module.exports = router; 