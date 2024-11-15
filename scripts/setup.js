const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function setup() {
  try {
    console.log('Starting clean setup...');

    // Kill any existing processes
    try {
      execSync('pkill node', { stdio: 'ignore' });
    } catch (e) {
      // Ignore if no processes to kill
    }

    // Clean directories
    const dirsToClean = [
      'node_modules',
      'frontend/node_modules',
      '.config',
      'package-lock.json',
      'frontend/package-lock.json'
    ];

    dirsToClean.forEach(dir => {
      const fullPath = path.join(__dirname, '..', dir);
      if (fs.existsSync(fullPath)) {
        console.log(`Removing ${dir}`);
        fs.rmSync(fullPath, { recursive: true, force: true });
      }
    });

    // Install backend dependencies
    console.log('\nInstalling backend dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Install frontend dependencies
    console.log('\nInstalling frontend dependencies...');
    process.chdir('frontend');
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
    process.chdir('..');

    console.log('\nSetup completed successfully!');
    console.log('\nStarting the application...');
    execSync('npm run dev', { stdio: 'inherit' });

  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setup(); 