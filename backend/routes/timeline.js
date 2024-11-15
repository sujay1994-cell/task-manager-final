const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');
const auth = require('../middleware/auth');

// Get task timeline
router.get('/tasks/:taskId/timeline', auth, timelineController.getTaskTimeline);

// Get timeline metrics
router.get('/tasks/:taskId/timeline/metrics', auth, timelineController.getTimelineMetrics);

// Get timeline summary
router.get('/tasks/:taskId/timeline/summary', auth, timelineController.getTimelineSummary);

module.exports = router; 