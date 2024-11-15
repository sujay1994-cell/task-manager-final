const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

describe('System Check', () => {
  beforeAll(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));
  });

  test('Server is running', async () => {
    try {
      const response = await axios.get(`http://localhost:${process.env.PORT || 3000}/api/health`);
      expect(response.status).toBe(200);
    } catch (error) {
      console.error('Server check failed:', error.message);
      throw error;
    }
  });

  test('MongoDB connection', async () => {
    try {
      const isConnected = mongoose.connection.readyState === 1;
      expect(isConnected).toBeTruthy();
    } catch (error) {
      console.error('Database check failed:', error.message);
      throw error;
    }
  });

  test('Authentication flow', async () => {
    try {
      // Test registration
      const registerResponse = await axios.post(`http://localhost:${process.env.PORT || 3000}/api/auth/register`, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'admin',
        department: 'Sales'
      });
      expect(registerResponse.status).toBe(201);

      // Test login
      const loginResponse = await axios.post(`http://localhost:${process.env.PORT || 3000}/api/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data).toHaveProperty('token');
    } catch (error) {
      console.error('Auth flow check failed:', error.message);
      throw error;
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
    }
  });
}); 