const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../backend/server');
const User = require('../../backend/models/User');
const Brand = require('../../backend/models/Brand');
const Edition = require('../../backend/models/Edition');
const Task = require('../../backend/models/Task');
const { setupTestData, clearDatabase } = require('../helpers/testUtils');

describe('Magazine Task Manager Integration Tests', () => {
  let testData;

  beforeAll(async () => {
    testData = await setupTestData();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe('Authentication & Access Control', () => {
    it('should successfully login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'superadmin@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('role', 'super_admin');
    });

    it('should deny access with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'superadmin@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });

    it('should access super admin dashboard', async () => {
      const response = await request(app)
        .get('/api/dashboard/all')
        .set('Authorization', `Bearer ${testData.tokens.superAdmin}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('overview');
      expect(response.body).toHaveProperty('departments');
    });

    it('should deny access to unauthorized dashboard', async () => {
      const response = await request(app)
        .get('/api/dashboard/all')
        .set('Authorization', `Bearer ${testData.tokens.salesManager}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Task Management', () => {
    let testTask;

    it('should create a new task', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${testData.tokens.salesManager}`)
        .send({
          name: 'Test Task',
          description: 'Test Description',
          department: 'Sales',
          deadline: new Date(),
          priority: 'high'
        });

      expect(response.status).toBe(201);
      testTask = response.body;
    });

    it('should update task status', async () => {
      const response = await request(app)
        .put(`/api/tasks/${testTask._id}/status`)
        .set('Authorization', `Bearer ${testData.tokens.salesManager}`)
        .send({
          status: 'in_progress'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('in_progress');
    });
  });
}); 