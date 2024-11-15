const mongoose = require('mongoose');

const editionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'review', 'completed', 'launched', 'signed_off'],
    default: 'planning'
  },
  releaseDate: {
    type: Date,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  launchStatus: {
    requested: Boolean,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: Date,
    launchDate: Date,
    notes: String
  },
  printApproval: {
    salesApproved: Boolean,
    editorialApproved: Boolean,
    approvedAt: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update brand's edition count
editionSchema.post('save', async function(doc) {
  const Brand = mongoose.model('Brand');
  await Brand.findByIdAndUpdate(doc.brand, {
    $inc: { editionCount: 1 }
  });
});

module.exports = mongoose.model('Edition', editionSchema); 