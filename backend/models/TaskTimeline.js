const mongoose = require('mongoose');

const taskTimelineSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  type: {
    type: String,
    enum: [
      'CREATED',
      'ASSIGNED',
      'STARTED',
      'SUBMITTED',
      'APPROVED',
      'REVISION',
      'COMPLETED'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  endTimestamp: Date,
  duration: Number,
  status: String,
  feedback: String,
  changes: [String],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
});

// Indexes for efficient querying
taskTimelineSchema.index({ taskId: 1, timestamp: -1 });
taskTimelineSchema.index({ taskId: 1, type: 1 });

module.exports = mongoose.model('TaskTimeline', taskTimelineSchema); 