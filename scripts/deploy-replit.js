const { execSync } = require('child_process');

async function deploy() {
  try {
    console.log('Starting deployment process...\n');

    // Create necessary directories
    execSync('mkdir -p .data/uploads .data/logs tmp', { stdio: 'inherit' });

    // Clean install
    execSync('rm -rf node_modules package-lock.json', { stdio: 'inherit' });
    execSync('npm cache clean --force', { stdio: 'inherit' });
    
    // Install dependencies
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Start application
    console.log('Starting application...');
    execSync('npm run dev', { stdio: 'inherit' });

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy(); 