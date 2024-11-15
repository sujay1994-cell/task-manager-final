const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Edition = require('../models/Edition');
const User = require('../models/User');
const Notification = require('../models/Notification');

describe('Workflow Tests', () => {
  let salesUser, editorialUser, designUser, adminUser;
  let testBrand, testEdition, testTask;

  beforeAll(async () => {
    // Create test users
    salesUser = await User.create({
      name: 'Sales User',
      email: 'sales@test.com',
      password: 'password123',
      role: 'sales',
      department: 'Sales'
    });

    editorialUser = await User.create({
      name: 'Editorial User',
      email: 'editorial@test.com',
      password: 'password123',
      role: 'editorial',
      department: 'Editorial'
    });

    designUser = await User.create({
      name: 'Design User',
      email: 'design@test.com',
      password: 'password123',
      role: 'design',
      department: 'Design'
    });

    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });

    // Create test brand and edition
    testBrand = await Brand.create({
      name: 'Test Brand',
      createdBy: adminUser._id
    });

    testEdition = await Edition.create({
      name: 'Test Edition',
      brand: testBrand._id,
      publishDate: new Date(),
      deadline: new Date(),
      createdBy: adminUser._id
    });
  });

  describe('Task Assignment Workflow', () => {
    it('should create and assign task to Editorial', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${salesUser.generateToken()}`)
        .send({
          name: 'Test Editorial Task',
          type: 'Editorial',
          editionId: testEdition._id,
          brandId: testBrand._id,
          department: 'Editorial',
          deadline: new Date()
        });

      expect(response.status).toBe(201);
      const notifications = await Notification.find({
        recipient: editorialUser._id,
        type: 'task_assigned'
      });
      expect(notifications).toHaveLength(1);
    });
  });

  describe('Deadline Notifications', () => {
    it('should create notifications for approaching deadlines', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      testTask = await Task.create({
        name: 'Deadline Test Task',
        type: 'Editorial',
        edition: testEdition._id,
        brand: testBrand._id,
        department: 'Editorial',
        assignedTo: editorialUser._id,
        deadline: tomorrow
      });

      await DeadlineMonitor.checkApproachingDeadlines();

      const notifications = await Notification.find({
        recipient: editorialUser._id,
        type: 'deadline_approaching'
      });
      expect(notifications).toHaveLength(1);
    });
  });

  describe('Launch Request Workflow', () => {
    it('should process launch request and notify teams', async () => {
      const response = await request(app)
        .post(`/api/editions/${testEdition._id}/launch-request`)
        .set('Authorization', `Bearer ${salesUser.generateToken()}`)
        .send({
          launchDate: new Date(),
          tasks: [testTask._id]
        });

      expect(response.status).toBe(200);
      
      const notifications = await Notification.find({
        type: 'launch_requested'
      });
      expect(notifications.length).toBeGreaterThan(0);
    });
  });

  describe('Reprint and Marketing Tasks', () => {
    it('should create marketing task after reprint completion', async () => {
      // Complete reprint task
      const reprintTask = await Task.create({
        name: 'Prepare Reprints',
        type: 'Other',
        edition: testEdition._id,
        brand: testBrand._id,
        department: 'Design',
        status: 'completed'
      });

      await MarketingFollowUp.scheduleMarketingTask(reprintTask);
      await MarketingFollowUp.checkMarketingTasks();

      const marketingTask = await Task.findOne({
        name: 'Prepare Twitter Marketing',
        edition: testEdition._id
      });
      expect(marketingTask).toBeTruthy();
    });
  });

  describe('Print Approval Workflow', () => {
    it('should require both Sales and Editorial approval', async () => {
      // Sales approval
      await request(app)
        .post(`/api/editions/${testEdition._id}/print-approval`)
        .set('Authorization', `Bearer ${salesUser.generateToken()}`)
        .send({ approved: true });

      let edition = await Edition.findById(testEdition._id);
      expect(edition.printApprovalRequest.salesApproved).toBe(true);
      expect(edition.printApprovalRequest.editorialApproved).toBe(false);

      // Editorial approval
      await request(app)
        .post(`/api/editions/${testEdition._id}/print-approval`)
        .set('Authorization', `Bearer ${editorialUser.generateToken()}`)
        .send({ approved: true });

      edition = await Edition.findById(testEdition._id);
      expect(edition.printApprovalRequest.editorialApproved).toBe(true);

      // Verify print task creation
      const printTask = await Task.findOne({
        name: new RegExp(`Generate Print.*${edition.name}`),
        department: 'Design'
      });
      expect(printTask).toBeTruthy();
    });
  });

  describe('Edition Sign-off and Archival', () => {
    it('should complete edition sign-off process', async () => {
      const printTask = await Task.findOne({
        name: new RegExp('Generate Print'),
        edition: testEdition._id
      });
      printTask.status = 'completed';
      await printTask.save();

      const response = await request(app)
        .post(`/api/editions/${testEdition._id}/complete`)
        .set('Authorization', `Bearer ${designUser.generateToken()}`)
        .send({
          printTaskId: printTask._id,
          comments: 'Final sign-off'
        });

      expect(response.status).toBe(200);

      const edition = await Edition.findById(testEdition._id);
      expect(edition.status).toBe('completed');
      expect(edition.signOff.designerSignOff).toBeTruthy();

      // Check completion notifications
      const notifications = await Notification.find({
        type: 'edition_completed'
      });
      expect(notifications.length).toBeGreaterThan(0);

      // Wait for archival (mock 24-hour delay)
      jest.advanceTimersByTime(24 * 60 * 60 * 1000);
      
      const archivedEdition = await Edition.findById(testEdition._id);
      expect(archivedEdition.status).toBe('archived');
    });
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Brand.deleteMany({});
    await Edition.deleteMany({});
    await Task.deleteMany({});
    await Notification.deleteMany({});
    await mongoose.connection.close();
  });
}); 