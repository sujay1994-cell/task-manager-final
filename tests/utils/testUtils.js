const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../backend/models/User');

const setupTestDB = () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Promise.all(
      Object.values(mongoose.connection.collections).map(async (collection) =>
        collection.deleteMany({})
      )
    );
  });
};

const generateTestToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET);
};

const createTestUser = async (role = 'user') => {
  const user = await User.create({
    name: 'Test User',
    email: `test-${role}@example.com`,
    password: 'password123',
    role: role,
    department: 'Sales'
  });
  
  const token = generateTestToken(user._id);
  return { user, token };
};

module.exports = {
  setupTestDB,
  generateTestToken,
  createTestUser
}; 