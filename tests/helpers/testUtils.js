const mongoose = require('mongoose');
const User = require('../../backend/models/User');
const Brand = require('../../backend/models/Brand');
const Edition = require('../../backend/models/Edition');
const Task = require('../../backend/models/Task');

const createTestUser = async (role = 'super_admin') => {
  const user = await User.create({
    email: `${role}@test.com`,
    password: 'password123',
    name: role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    department: role.includes('sales') ? 'Sales' : 
               role.includes('editorial') ? 'Editorial' :
               role.includes('design') ? 'Design' : 'Admin',
    role: role
  });
  return user;
};

const setupTestData = async () => {
  const superAdmin = await createTestUser('super_admin');
  const salesManager = await createTestUser('sales_manager');
  const editorialManager = await createTestUser('editorial_manager');
  const designManager = await createTestUser('design_manager');

  return {
    superAdmin,
    salesManager,
    editorialManager,
    designManager,
    tokens: {
      superAdmin: superAdmin.generateToken(),
      salesManager: salesManager.generateToken(),
      editorialManager: editorialManager.generateToken(),
      designManager: designManager.generateToken()
    }
  };
};

const clearDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    await Promise.all([
      User.deleteMany({}),
      Brand.deleteMany({}),
      Edition.deleteMany({}),
      Task.deleteMany({})
    ]);
  }
};

module.exports = {
  createTestUser,
  setupTestData,
  clearDatabase
}; 