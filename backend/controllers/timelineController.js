const TaskTimeline = require('../models/TaskTimeline');
const Task = require('../models/Task');

exports.getTaskTimeline = async (req, res) => {
  try {
    const timeline = await TaskTimeline.find({ taskId: req.params.taskId })
      .sort({ timestamp: -1 })
      .populate('user', 'name avatar')
      .lean();

    res.json(timeline);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTimelineEvent = async (taskId, eventData) => {
  try {
    const {
      type,
      title,
      description,
      userId,
      feedback,
      changes,
      metadata
    } = eventData;

    // Get previous event if exists
    const previousEvent = await TaskTimeline.findOne({ taskId })
      .sort({ timestamp: -1 });

    const timelineEvent = new TaskTimeline({
      taskId,
      type,
      title,
      description,
      user: userId,
      feedback,
      changes,
      metadata
    });

    // If there's a previous event, calculate duration
    if (previousEvent) {
      previousEvent.endTimestamp = new Date();
      previousEvent.duration = previousEvent.endTimestamp - previousEvent.timestamp;
      await previousEvent.save();
    }

    await timelineEvent.save();

    // Update task status
    await Task.findByIdAndUpdate(taskId, { status: type });

    return timelineEvent;
  } catch (error) {
    console.error('Error creating timeline event:', error);
    throw error;
  }
};

exports.getTimelineMetrics = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Get all timeline events for the task
    const events = await TaskTimeline.find({ taskId })
      .sort({ timestamp: 1 });

    // Calculate metrics
    const metrics = {
      totalDuration: 0,
      averageStepDuration: 0,
      longestStep: null,
      revisionCount: 0,
      stepCounts: {}
    };

    events.forEach((event, index) => {
      // Count events by type
      metrics.stepCounts[event.type] = (metrics.stepCounts[event.type] || 0) + 1;

      // Count revisions
      if (event.type === 'REVISION') {
        metrics.revisionCount++;
      }

      // Calculate durations
      if (event.duration) {
        metrics.totalDuration += event.duration;
        
        if (!metrics.longestStep || event.duration > metrics.longestStep.duration) {
          metrics.longestStep = {
            type: event.type,
            duration: event.duration,
            timestamp: event.timestamp
          };
        }
      }
    });

    // Calculate average duration
    const stepCount = events.length - 1; // Exclude the last (current) step
    metrics.averageStepDuration = stepCount > 0 ? 
      metrics.totalDuration / stepCount : 0;

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTimelineSummary = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const summary = await TaskTimeline.aggregate([
      { $match: { taskId: mongoose.Types.ObjectId(taskId) } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          lastOccurrence: { $first: '$timestamp' }
        }
      }
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 