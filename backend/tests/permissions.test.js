const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');

describe('Permission Verification Tests', () => {
  let tokens = {};
  let testUsers = {};
  let testTask;

  beforeAll(async () => {
    // Create test users for each role
    const roles = [
      'super_admin',
      'super_manager',
      'sales_manager',
      'editorial_manager',
      'design_manager',
      'sales_member',
      'editorial_member',
      'design_member'
    ];

    for (const role of roles) {
      const user = await User.create({
        name: `Test ${role}`,
        email: `${role}@test.com`,
        password: 'password123',
        role: role,
        department: role.includes('sales') ? 'Sales' :
                   role.includes('editorial') ? 'Editorial' :
                   role.includes('design') ? 'Design' : null
      });
      testUsers[role] = user;

      // Get auth token
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: `${role}@test.com`,
          password: 'password123'
        });
      tokens[role] = response.body.token;
    }

    // Create test task
    testTask = await Task.create({
      name: 'Test Task',
      type: 'Editorial',
      department: 'Editorial',
      deadline: new Date(),
      createdBy: testUsers.super_admin._id
    });
  });

  describe('Super Admin Permissions', () => {
    it('should access all department dashboards', async () => {
      const departments = ['Sales', 'Editorial', 'Design'];
      
      for (const dept of departments) {
        const response = await request(app)
          .get(`/api/dashboard/${dept}`)
          .set('Authorization', `Bearer ${tokens.super_admin}`);
        expect(response.status).toBe(200);
      }
    });

    it('should manage users', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${tokens.super_admin}`)
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          password: 'password123',
          role: 'sales_member'
        });
      expect(response.status).toBe(201);
    });
  });

  describe('Department Manager Restrictions', () => {
    it('should not access other department dashboards', async () => {
      const response = await request(app)
        .get('/api/dashboard/Editorial')
        .set('Authorization', `Bearer ${tokens.sales_manager}`);
      expect(response.status).toBe(403);
    });

    it('should not modify other department tasks', async () => {
      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${tokens.sales_manager}`)
        .send({ status: 'completed' });
      expect(response.status).toBe(403);
    });
  });

  describe('Team Member Restrictions', () => {
    it('should only access own tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${tokens.editorial_member}`);
      expect(response.status).toBe(200);
      expect(response.body.every(task => 
        task.assignedTo === testUsers.editorial_member._id ||
        task.department === 'Editorial'
      )).toBe(true);
    });

    it('should not create new tasks', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokens.sales_member}`)
        .send({
          name: 'Unauthorized Task',
          type: 'Sales',
          deadline: new Date()
        });
      expect(response.status).toBe(403);
    });
  });

  describe('Cross-Department Access', () => {
    it('should prevent unauthorized department access', async () => {
      const response = await request(app)
        .get('/api/tasks/department/Sales')
        .set('Authorization', `Bearer ${tokens.editorial_member}`);
      expect(response.status).toBe(403);
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Task.deleteMany({});
    await mongoose.connection.close();
  });
}); 