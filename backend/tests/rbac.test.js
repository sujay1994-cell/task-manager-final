const request = require('supertest');
const app = require('../server');
const { createTestUser, clearDatabase } = require('../tests/helpers/testUtils');

describe('Role-Based Access Control Tests', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Super Admin Access Tests', () => {
    it('should access all department dashboards', async () => {
      const superAdmin = await createTestUser('super_admin');
      const token = superAdmin.generateToken();
      
      const response = await request(app)
        .get('/api/dashboard/all')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
    });
  });
}); 