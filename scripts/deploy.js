const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  frontend: {
    dir: 'frontend',
    buildCommand: 'npm run build',
    installCommand: 'npm install'
  },
  backend: {
    dir: 'backend',
    installCommand: 'npm install',
    startCommand: 'npm start'
  }
};

// Deployment script
async function deploy() {
  try {
    console.log('🚀 Starting deployment process...');

    // Backend deployment
    console.log('\n📦 Deploying backend...');
    process.chdir(path.join(process.cwd(), config.backend.dir));
    
    console.log('Installing backend dependencies...');
    execSync(config.backend.installCommand, { stdio: 'inherit' });

    // Create necessary directories
    console.log('Creating upload directories...');
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Frontend deployment
    console.log('\n📦 Deploying frontend...');
    process.chdir(path.join(process.cwd(), '..', config.frontend.dir));
    
    console.log('Installing frontend dependencies...');
    execSync(config.frontend.installCommand, { stdio: 'inherit' });

    console.log('Building frontend...');
    execSync(config.frontend.buildCommand, { stdio: 'inherit' });

    // Create .env files if they don't exist
    createEnvFiles();

    console.log('\n✅ Deployment completed successfully!');
    console.log('\nTo start the application:');
    console.log('1. Backend: cd backend && npm start');
    console.log('2. Frontend: cd frontend && npm start');

  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Create environment files
function createEnvFiles() {
  const backendEnv = path.join(process.cwd(), '..', 'backend', '.env');
  const frontendEnv = path.join(process.cwd(), '.env');

  if (!fs.existsSync(backendEnv)) {
    console.log('\nCreating backend .env file...');
    const backendEnvContent = `
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=production
FRONTEND_URL=https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co
UPLOAD_DIR=uploads
MAX_FILE_SIZE=50000000
`;
    fs.writeFileSync(backendEnv, backendEnvContent.trim());
  }

  if (!fs.existsSync(frontendEnv)) {
    console.log('Creating frontend .env file...');
    const frontendEnvContent = `
REACT_APP_API_URL=https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co
REACT_APP_SOCKET_URL=https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co
`;
    fs.writeFileSync(frontendEnv, frontendEnvContent.trim());
  }
}

// Run deployment
deploy(); 