const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function cleanup() {
  const rootDir = process.cwd();
  const frontendDir = path.join(rootDir, 'frontend');

  // Remove all node_modules and lock files
  const dirsToClean = [
    path.join(rootDir, 'node_modules'),
    path.join(rootDir, 'package-lock.json'),
    path.join(frontendDir, 'node_modules'),
    path.join(frontendDir, 'package-lock.json'),
    path.join(rootDir, '.config')
  ];

  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`Removing ${dir}`);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  // Clean npm cache
  execSync('npm cache clean --force', { stdio: 'inherit' });
}

cleanup(); 