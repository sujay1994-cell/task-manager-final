const fs = require('fs');
const path = require('path');

const requiredEnvVars = {
  backend: [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'UPLOAD_PATH'
  ],
  frontend: [
    'REACT_APP_API_URL',
    'REACT_APP_ENV'
  ]
};

const checkEnvironment = () => {
  console.log('Checking environment configuration...\n');

  // Check backend environment
  const backendEnv = path.join(__dirname, '../backend/.env');
  if (!fs.existsSync(backendEnv)) {
    console.error('❌ Backend .env file missing');
    process.exit(1);
  }

  const backendVars = require('dotenv').parse(fs.readFileSync(backendEnv));
  requiredEnvVars.backend.forEach(variable => {
    if (!backendVars[variable]) {
      console.error(`❌ Missing backend environment variable: ${variable}`);
      process.exit(1);
    }
  });

  // Check frontend environment
  const frontendEnv = path.join(__dirname, '../frontend/.env');
  if (!fs.existsSync(frontendEnv)) {
    console.error('❌ Frontend .env file missing');
    process.exit(1);
  }

  const frontendVars = require('dotenv').parse(fs.readFileSync(frontendEnv));
  requiredEnvVars.frontend.forEach(variable => {
    if (!frontendVars[variable]) {
      console.error(`❌ Missing frontend environment variable: ${variable}`);
      process.exit(1);
    }
  });

  console.log('✅ Environment configuration complete\n');
};

module.exports = checkEnvironment; 