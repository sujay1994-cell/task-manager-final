const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const killPort = require('../backend/killPort');

async function startup() {
  try {
    // Kill any existing processes on our ports
    await killPort(5000);
    await killPort(3001);

    // Ensure directories exist
    const dirs = [
      '.data/uploads',
      '.data/logs',
      '.config/npm/node_global'
    ];

    dirs.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });

    // Update environment variables to use .data directory
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(
      /UPLOAD_PATH=.*$/m,
      `UPLOAD_PATH=${path.join(process.cwd(), '.data/uploads')}`
    );
    envContent = envContent.replace(
      /LOG_FILE_PATH=.*$/m,
      `LOG_FILE_PATH=${path.join(process.cwd(), '.data/logs/app.log')}`
    );
    fs.writeFileSync(envPath, envContent);

    // Start the application
    if (process.env.NODE_ENV === 'production') {
      execSync('npm start', { stdio: 'inherit' });
    } else {
      execSync('npm run dev', { stdio: 'inherit' });
    }
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
}

startup(); 