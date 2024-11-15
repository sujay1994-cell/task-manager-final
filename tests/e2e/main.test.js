const { chromium } = require('playwright');
const axios = require('axios');
const Docker = require('dockerode');
const docker = new Docker();

describe('MagazineTaskManager E2E Tests', () => {
  let browser;
  let page;
  let containers = {};
  
  beforeAll(async () => {
    // Start Docker containers
    await docker.compose.upAll({
      cwd: process.cwd(),
      log: true,
      commandOptions: ['--build']
    });

    // Wait for services to be healthy
    await waitForHealthyServices();

    browser = await chromium.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
    // Stop Docker containers
    await docker.compose.down({
      cwd: process.cwd(),
      log: true
    });
  });

  async function waitForHealthyServices() {
    const services = ['frontend', 'backend', 'mongodb'];
    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const healthChecks = await Promise.all([
          axios.get('http://localhost/health'),
          axios.get('http://localhost:5000/health'),
          axios.get('http://localhost:27017')
        ]);

        if (healthChecks.every(check => check.status === 200)) {
          console.log('All services are healthy');
          return;
        }
      } catch (error) {
        console.log(`Waiting for services... Attempt ${attempts + 1}/${maxAttempts}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Services failed to become healthy');
  }

  describe('Authentication & Role Access', () => {
    const users = {
      superAdmin: { email: 'superadmin@test.com', password: 'password123' },
      superManager: { email: 'supermanager@test.com', password: 'password123' },
      salesManager: { email: 'salesmanager@test.com', password: 'password123' },
      editorialManager: { email: 'editorialmanager@test.com', password: 'password123' },
      designManager: { email: 'designmanager@test.com', password: 'password123' },
      salesMember: { email: 'salesmember@test.com', password: 'password123' }
    };

    for (const [role, credentials] of Object.entries(users)) {
      test(`${role} can login and access appropriate dashboard`, async () => {
        await page.goto('http://localhost/login');
        
        // Login
        await page.fill('input[name="email"]', credentials.email);
        await page.fill('input[name="password"]', credentials.password);
        await page.click('button[type="submit"]');

        // Check redirect to appropriate dashboard
        await page.waitForSelector('.dashboard-header');
        const dashboardTitle = await page.textContent('.dashboard-header');
        
        // Verify dashboard access based on role
        switch (role) {
          case 'superAdmin':
            expect(dashboardTitle).toContain('Super Admin Dashboard');
            // Check access to all department dashboards
            await page.click('text=Sales Dashboard');
            expect(await page.isVisible('.sales-dashboard')).toBeTruthy();
            break;
          case 'salesManager':
            expect(dashboardTitle).toContain('Sales Dashboard');
            // Verify no access to other departments
            expect(await page.isVisible('text=Editorial Dashboard')).toBeFalsy();
            break;
          // Add cases for other roles
        }

        // Logout
        await page.click('button.logout-button');
        await page.waitForSelector('.login-form');
      });
    }
  });

  describe('Task Workflow', () => {
    test('Complete task workflow from Sales to Design', async () => {
      // Login as Sales Manager
      await loginAs(page, users.salesManager);

      // Create new task
      await page.click('button:text("Create Task")');
      await page.fill('input[name="taskName"]', 'Test Magazine Cover');
      await page.selectOption('select[name="department"]', 'Editorial');
      await page.click('button:text("Submit")');

      // Verify task creation
      await page.waitForSelector('text=Test Magazine Cover');

      // Login as Editorial Manager
      await loginAs(page, users.editorialManager);

      // Accept and complete editorial work
      await page.click('text=Test Magazine Cover');
      await page.click('button:text("Accept Task")');
      await page.click('button:text("Mark Complete")');

      // Verify task moves to Design
      await loginAs(page, users.designManager);
      await page.waitForSelector('text=Test Magazine Cover');
    });
  });

  describe('Notifications', () => {
    test('Deadline notifications are received', async () => {
      // Create task with close deadline
      await loginAs(page, users.salesManager);
      await createTaskWithDeadline(page, 'Urgent Task', new Date());

      // Check notifications
      await page.click('.notification-bell');
      await page.waitForSelector('text=Deadline approaching');
    });
  });

  describe('Calendar Integration', () => {
    test('Calendar shows all relevant tasks', async () => {
      await loginAs(page, users.superAdmin);
      await page.click('text=Calendar');

      // Verify calendar elements
      await page.waitForSelector('.calendar-view');
      const tasks = await page.$$('.calendar-event');
      expect(tasks.length).toBeGreaterThan(0);
    });
  });

  describe('Automated Workflows', () => {
    test('Reprint task is created after magazine launch', async () => {
      // Launch magazine
      await loginAs(page, users.salesManager);
      await launchMagazine(page, 'Test Edition');

      // Wait 48 hours (mocked)
      jest.advanceTimersByTime(48 * 60 * 60 * 1000);

      // Check for reprint task
      await page.reload();
      await page.waitForSelector('text=Prepare Reprints');
    });
  });
});

async function loginAs(page, credentials) {
  await page.goto('http://localhost/login');
  await page.fill('input[name="email"]', credentials.email);
  await page.fill('input[name="password"]', credentials.password);
  await page.click('button[type="submit"]');
  await page.waitForSelector('.dashboard-header');
}

async function createTaskWithDeadline(page, name, deadline) {
  await page.click('button:text("Create Task")');
  await page.fill('input[name="taskName"]', name);
  await page.fill('input[name="deadline"]', deadline.toISOString().split('T')[0]);
  await page.click('button:text("Submit")');
}

async function launchMagazine(page, editionName) {
  await page.click(`text=${editionName}`);
  await page.click('button:text("Launch Magazine")');
  await page.click('button:text("Confirm Launch")');
} 