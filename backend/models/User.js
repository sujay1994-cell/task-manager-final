const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  department: {
    type: String,
    enum: ['sales', 'editorial', 'design'],
    required: true
  },
  role: {
    type: String,
    enum: [
      'sales_manager',
      'sales_team',
      'editorial_manager',
      'editorial_team',
      'design_manager',
      'design_team'
    ],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema); 