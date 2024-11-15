const request = require('supertest');
const app = require('../../backend/server');
const { setupTestDB, createTestUser } = require('../utils/testUtils');

setupTestDB();

describe('Auth Routes', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const { user } = await createTestUser();
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', user.email);
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@email.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
    });
  });
}); 