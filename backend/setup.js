const fs = require('fs');
const path = require('path');

console.log('🚀 Starting setup process...');

// Create required directories
const dirs = [
  '.data/uploads',
  '.data/logs',
  'models',
  'routes',
  'controllers',
  'middleware',
  'config'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

console.log('✅ Setup complete!'); 