const fs = require('fs');
const path = require('path');

// Create necessary directories
const createDirectories = () => {
  const directories = [
    'uploads',
    'models',
    'routes',
    'controllers',
    'middleware',
    'config'
  ];

  directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

// Create .env file if it doesn't exist
const createEnvFile = () => {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    const envContent = `
PORT=5000
MONGODB_URI=mongodb+srv://your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
UPLOAD_DIR=uploads
MAX_FILE_SIZE=50000000
    `.trim();

    fs.writeFileSync(envPath, envContent);
  }
};

// Initialize application
const init = () => {
  console.log('🚀 Initializing application...');
  createDirectories();
  createEnvFile();
  console.log('✅ Initialization complete!');
};

init(); 