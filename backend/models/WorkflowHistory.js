const mongoose = require('mongoose');

const workflowHistorySchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  action: {
    type: String,
    enum: [
      'CREATED',
      'ASSIGNED',
      'STARTED',
      'SUBMITTED',
      'CHANGES_REQUESTED',
      'APPROVED',
      'COMPLETED'
    ],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  feedback: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
});

// Index for efficient querying
workflowHistorySchema.index({ taskId: 1, timestamp: -1 });

module.exports = mongoose.model('WorkflowHistory', workflowHistorySchema); 