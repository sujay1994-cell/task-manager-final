const { chromium } = require('playwright');
const { setupTestDB, createTestUser } = require('../utils/testUtils');

describe('App Flow Tests', () => {
  let browser;
  let page;
  let testUser;

  beforeAll(async () => {
    browser = await chromium.launch();
    testUser = await createTestUser('admin');
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:3001');
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('Authentication Flow', () => {
    test('should login and redirect to dashboard', async () => {
      // Check redirect to login
      expect(page.url()).toContain('/login');

      // Login
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');

      // Check redirect to dashboard
      await page.waitForURL('http://localhost:3001/');
      expect(page.url()).toBe('http://localhost:3001/');

      // Verify dashboard elements
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('.dashboard-stats')).toBeVisible();
    });

    test('should show error for invalid credentials', async () => {
      await page.fill('input[type="email"]', 'wrong@email.com');
      await page.fill('input[type="password"]', 'wrongpass');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=Invalid email or password')).toBeVisible();
    });
  });

  describe('Navigation Flow', () => {
    beforeEach(async () => {
      // Login before each test
      await loginUser(page, testUser);
    });

    test('should navigate to all main sections', async () => {
      // Test Tasks navigation
      await page.click('text=Tasks');
      await expect(page.locator('text=Task Management')).toBeVisible();

      // Test Brands navigation
      await page.click('text=Brands');
      await expect(page.locator('text=Brand Management')).toBeVisible();

      // Test Editions navigation
      await page.click('text=Editions');
      await expect(page.locator('text=Edition Management')).toBeVisible();

      // Test User Management (admin only)
      await page.click('text=User Management');
      await expect(page.locator('text=User Management')).toBeVisible();
    });
  });

  describe('Task Management Flow', () => {
    beforeEach(async () => {
      await loginUser(page, testUser);
      await page.click('text=Tasks');
    });

    test('should create and manage a task', async () => {
      // Create new task
      await page.click('text=Create Task');
      await page.fill('input[name="name"]', 'Test Task');
      await page.fill('textarea[name="description"]', 'Test Description');
      await page.selectOption('select[name="department"]', 'Sales');
      await page.fill('input[name="deadline"]', getTomorrowDate());
      await page.click('button:text("Create")');

      // Verify task creation
      await expect(page.locator('text=Test Task')).toBeVisible();

      // Update task status
      await page.click('[data-testid="task-menu-button"]');
      await page.click('text=Set as In Progress');
      await expect(page.locator('text=In Progress')).toBeVisible();
    });
  });

  describe('Calendar Integration', () => {
    beforeEach(async () => {
      await loginUser(page, testUser);
    });

    test('should display tasks in calendar', async () => {
      // Create task with deadline
      await createTestTask(page, 'Calendar Task', getTomorrowDate());

      // Navigate to calendar
      await page.click('text=Calendar');

      // Verify task appears in calendar
      await expect(page.locator('text=Calendar Task')).toBeVisible();
    });
  });

  describe('Analytics Dashboard', () => {
    beforeEach(async () => {
      await loginUser(page, testUser);
      await page.click('text=Dashboard');
    });

    test('should display correct statistics', async () => {
      // Create test data
      await createTestTask(page, 'Analytics Task 1', getTomorrowDate());
      await createTestTask(page, 'Analytics Task 2', getTomorrowDate());

      // Verify statistics
      await expect(page.locator('.total-tasks')).toContainText('2');
      await expect(page.locator('.pending-tasks')).toContainText('2');
      
      // Verify charts
      await expect(page.locator('canvas.task-status-chart')).toBeVisible();
      await expect(page.locator('canvas.task-trend-chart')).toBeVisible();
    });
  });
});

// Helper functions
async function loginUser(page, user) {
  await page.goto('http://localhost:3001/login');
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:3001/');
}

async function createTestTask(page, name, deadline) {
  await page.click('text=Tasks');
  await page.click('text=Create Task');
  await page.fill('input[name="name"]', name);
  await page.fill('textarea[name="description"]', 'Test Description');
  await page.selectOption('select[name="department"]', 'Sales');
  await page.fill('input[name="deadline"]', deadline);
  await page.click('button:text("Create")');
}

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
} 