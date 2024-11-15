const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

async function testConnections() {
  try {
    console.log('Testing Database Connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    console.log('\nTesting API Endpoints...');
    const endpoints = [
      { method: 'GET', url: '/api/health' },
      { method: 'GET', url: '/api/brands' },
      { method: 'GET', url: '/api/editions' },
      { method: 'GET', url: '/api/tasks' }
    ];

    for (const endpoint of endpoints) {
      try {
        await axios({
          method: endpoint.method,
          url: `http://localhost:${process.env.PORT}${endpoint.url}`
        });
        console.log(`✅ ${endpoint.method} ${endpoint.url} - OK`);
      } catch (error) {
        console.error(`❌ ${endpoint.method} ${endpoint.url} - Failed`);
      }
    }

    console.log('\nChecking Required Environment Variables...');
    const requiredEnvVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'PORT',
      'NODE_ENV'
    ];

    requiredEnvVars.forEach(variable => {
      if (process.env[variable]) {
        console.log(`✅ ${variable} is set`);
      } else {
        console.error(`❌ ${variable} is missing`);
      }
    });

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testConnections(); 