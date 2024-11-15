const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config({ path: './tests/config/test.env' });

async function verifySetup() {
  console.log('\n🔍 Verifying test environment setup...\n');

  // Check environment variables
  console.log('📋 Checking environment variables:');
  const requiredEnvVars = ['NODE_ENV', 'PORT', 'MONGODB_URI', 'JWT_SECRET'];
  let envErrors = false;
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`  ✅ ${envVar} is set`);
    } else {
      console.log(`  ❌ ${envVar} is missing`);
      envErrors = true;
    }
  }

  // Test in-memory MongoDB
  console.log('\n📦 Testing MongoDB connection:');
  let mongoServer;
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log('  ✅ Successfully connected to MongoDB');
    await mongoose.disconnect();
    await mongoServer.stop();
  } catch (error) {
    console.log('  ❌ MongoDB connection failed:', error.message);
    envErrors = true;
  }

  // Check required directories
  console.log('\n📁 Checking required directories:');
  const requiredDirs = [
    'tests/test-files',
    'frontend/build',
    'backend/uploads'
  ];

  for (const dir of requiredDirs) {
    if (fs.existsSync(path.join(process.cwd(), dir))) {
      console.log(`  ✅ ${dir} exists`);
    } else {
      console.log(`  ⚠️ ${dir} is missing - creating...`);
      fs.mkdirSync(path.join(process.cwd(), dir), { recursive: true });
    }
  }

  // Create test file
  const testFilePath = path.join(process.cwd(), 'tests/test-files/design.pdf');
  if (!fs.existsSync(testFilePath)) {
    fs.writeFileSync(testFilePath, 'Test PDF content');
    console.log('  ✅ Created test PDF file');
  }

  if (envErrors) {
    console.log('\n❌ Setup verification failed. Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ Setup verification completed successfully!\n');
  }
}

verifySetup().catch(console.error); 