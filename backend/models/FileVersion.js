const mongoose = require('mongoose');

const fileVersionSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: String,
  path: {
    type: String,
    required: true
  },
  mimeType: String,
  size: Number,
  version: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [{
    text: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  metadata: {
    dimensions: {
      width: Number,
      height: Number
    },
    resolution: String,
    colorSpace: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add methods to the fileVersion schema
fileVersionSchema.statics.getLatestVersion = async function(taskId) {
  const latest = await this.findOne({ task: taskId })
    .sort('-version')
    .exec();
  return latest ? latest.version : 0;
};

fileVersionSchema.methods.addComment = async function(userId, text) {
  this.comments.push({
    text,
    user: userId
  });
  return this.save();
};

fileVersionSchema.index({ task: 1, version: 1 });

fileVersionSchema.methods.getMetadata = async function() {
  // Add metadata extraction based on file type
  const metadata = {};
  
  if (this.mimeType.startsWith('image/')) {
    // Add image dimension extraction
    const dimensions = await getImageDimensions(this.path);
    metadata.dimensions = dimensions;
  }
  
  return metadata;
};

fileVersionSchema.methods.compareWith = async function(otherId) {
  const other = await this.model('FileVersion').findById(otherId);
  if (!other) return null;
  
  return {
    sizeChange: this.size - other.size,
    isNewer: this.version > other.version,
    timeDiff: this.createdAt - other.createdAt
  };
};

module.exports = mongoose.model('FileVersion', fileVersionSchema); 