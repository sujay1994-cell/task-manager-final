const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function start() {
  try {
    console.log('Starting application setup...');

    // Create required directories
    const dirs = ['.data/uploads', '.data/logs'];
    dirs.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });

    // Install dependencies without scripts
    console.log('Installing dependencies...');
    process.env.npm_config_ignore_scripts = 'true';
    
    // Backend
    if (!fs.existsSync('node_modules')) {
      execSync('npm install --no-optional', { stdio: 'inherit' });
    }

    // Frontend
    if (!fs.existsSync('frontend/node_modules')) {
      process.chdir('frontend');
      execSync('npm install --no-optional', { stdio: 'inherit' });
      process.chdir('..');
    }

    // Start the application
    console.log('Starting servers...');
    execSync('npm run dev', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_OPTIONS: '--openssl-legacy-provider' }
    });

  } catch (error) {
    console.error('Startup failed:', error);
    process.exit(1);
  }
}

start(); 