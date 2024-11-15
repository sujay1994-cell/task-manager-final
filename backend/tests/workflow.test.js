const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Task = require('../models/Task');
const Edition = require('../models/Edition');
const Brand = require('../models/Brand');
const Notification = require('../models/Notification');
const { setupTestData, clearDatabase } = require('../../tests/helpers/testUtils');

describe('Workflow Integration Tests', () => {
  let users = {};
  let tokens = {};
  let testBrand, testEdition, testTask;

  beforeAll(async () => {
    await clearDatabase();
    const testData = await setupTestData();
    users = {
      salesManager: testData.salesManager,
      editorialManager: testData.editorialManager,
      designManager: testData.designManager
    };
    tokens = testData.tokens;

    // Create test brand and edition
    testBrand = await Brand.create({
      name: 'Test Brand',
      description: 'Test Brand Description',
      createdBy: users.salesManager._id
    });

    testEdition = await Edition.create({
      name: 'Test Edition',
      brand: testBrand._id,
      status: 'draft',
      publishDate: new Date(),
      createdBy: users.salesManager._id
    });

    testTask = await Task.create({
      name: 'Test Task',
      description: 'Test Task Description',
      edition: testEdition._id,
      department: 'Editorial',
      deadline: new Date(),
      assignedTo: users.editorialManager._id,
      createdBy: users.salesManager._id
    });
  });

  describe('Task Creation and Assignment Workflow', () => {
    it('should create a task and assign to Editorial', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokens.salesManager}`)
        .send({
          name: 'New Editorial Task',
          description: 'Test Description',
          edition: testEdition._id,
          department: 'Editorial',
          deadline: new Date(),
          assignedTo: users.editorialManager._id
        });

      expect(response.status).toBe(201);
      expect(response.body.department).toBe('Editorial');
    });
  });

  // ... rest of your test cases ...

  afterAll(async () => {
    await clearDatabase();
  });
}); 