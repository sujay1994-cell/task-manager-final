const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connection test successful!');
    process.exit(0);
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    process.exit(1);
  }
}

testConnection(); 