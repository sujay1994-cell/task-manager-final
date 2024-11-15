const request = require('supertest');
const app = require('../../backend/server');
const { setupTestDB, createTestUser } = require('../utils/testUtils');

setupTestDB();

describe('Task Routes', () => {
  let authToken;
  let user;

  beforeEach(async () => {
    const testUser = await createTestUser('admin');
    authToken = testUser.token;
    user = testUser.user;
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        name: 'Test Task',
        description: 'Test Description',
        department: 'Sales',
        priority: 'high',
        deadline: new Date()
      };

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', taskData.name);
    });
  });

  describe('GET /api/tasks', () => {
    it('should get all tasks', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });
}); 