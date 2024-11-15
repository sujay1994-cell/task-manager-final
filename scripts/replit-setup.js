const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function setupReplit() {
  try {
    console.log('Setting up Replit environment...');

    // Create necessary directories
    const dirs = [
      '.data/uploads',
      '.data/logs',
      'tmp'
    ];

    dirs.forEach(dir => {
      const fullPath = path.join(__dirname, '..', dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    });

    // Clean previous installations
    console.log('\nCleaning previous installations...');
    execSync('rm -rf node_modules frontend/node_modules package-lock.json frontend/package-lock.json', { stdio: 'inherit' });

    // Install backend dependencies
    console.log('\nInstalling backend dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Install frontend dependencies
    console.log('\nInstalling frontend dependencies...');
    process.chdir('frontend');
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
    
    // Create .env file if it doesn't exist
    if (!fs.existsSync('.env')) {
      fs.writeFileSync('.env', 'SKIP_PREFLIGHT_CHECK=true\nGENERATE_SOURCEMAP=false\nNODE_OPTIONS=--openssl-legacy-provider\n');
    }
    
    // Build frontend with specific Node options
    console.log('\nBuilding frontend...');
    execSync('export NODE_OPTIONS="--openssl-legacy-provider --max_old_space_size=4096" && npm run build', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_OPTIONS: '--openssl-legacy-provider --max_old_space_size=4096' }
    });
    
    // Return to root directory
    process.chdir('..');

    console.log('\nSetup complete! Run "npm start" to start the application.');

  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

setupReplit();