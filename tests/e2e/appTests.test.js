const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Magazine Task Manager E2E Tests', () => {
  let testFile;

  test.beforeAll(async () => {
    // Create test file for upload tests
    testFile = path.join(__dirname, 'test-file.pdf');
    fs.writeFileSync(testFile, 'Test content');
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login as test user
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForSelector('[data-testid="dashboard"]');
  });

  test('File Upload and Download Performance', async ({ page }) => {
    // Test file upload speed
    const uploadStartTime = Date.now();
    await page.setInputFiles('input[type="file"]', testFile);
    await page.waitForSelector('[data-testid="upload-success"]');
    const uploadDuration = Date.now() - uploadStartTime;
    expect(uploadDuration).toBeLessThan(3000); // Upload should take less than 3 seconds

    // Test file download speed
    const downloadStartTime = Date.now();
    await page.click('[data-testid="download-button"]');
    await page.waitForEvent('download');
    const downloadDuration = Date.now() - downloadStartTime;
    expect(downloadDuration).toBeLessThan(2000); // Download should take less than 2 seconds
  });

  test('Real-time Updates and Notifications', async ({ page, context }) => {
    // Create a second page for the receiving user
    const secondPage = await context.newPage();
    await secondPage.goto('/');
    await loginUser(secondPage, 'editor@example.com', 'password123');

    // Create and assign task
    await page.click('[data-testid="create-task-button"]');
    await page.fill('[data-testid="task-name"]', 'Test Task');
    await page.selectOption('[data-testid="department"]', 'Editorial');
    await page.click('[data-testid="submit-task"]');

    // Verify notification appears on second page
    await secondPage.waitForSelector('[data-testid="notification-badge"]');
    const notificationText = await secondPage.textContent('[data-testid="notification-message"]');
    expect(notificationText).toContain('New task assigned');
  });

  test('Task Workflow and Assignment Flow', async ({ page }) => {
    // Create task
    await page.click('[data-testid="create-task-button"]');
    await fillTaskForm(page, {
      name: 'Test Workflow Task',
      brand: 'Test Brand',
      edition: 'Test Edition',
      type: 'Profile'
    });

    // Verify task creation
    await page.waitForSelector('text=Test Workflow Task');

    // Assign task
    await page.click('[data-testid="assign-task"]');
    await page.selectOption('[data-testid="assignee"]', 'editor1');
    await page.click('[data-testid="confirm-assign"]');

    // Verify assignment
    const assigneeText = await page.textContent('[data-testid="task-assignee"]');
    expect(assigneeText).toContain('editor1');

    // Reassign task
    await page.click('[data-testid="reassign-task"]');
    await page.selectOption('[data-testid="assignee"]', 'editor2');
    await page.click('[data-testid="confirm-assign"]');

    // Verify reassignment
    const newAssigneeText = await page.textContent('[data-testid="task-assignee"]');
    expect(newAssigneeText).toContain('editor2');
  });

  test('Search and Task History', async ({ page }) => {
    // Create test task with history
    const taskId = await createTestTaskWithHistory(page);

    // Test search by task ID
    await page.fill('[data-testid="search-input"]', taskId);
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector(`text=${taskId}`);

    // Verify task history
    await page.click('[data-testid="view-history"]');
    const historyItems = await page.$$('[data-testid="history-item"]');
    expect(historyItems.length).toBeGreaterThan(0);

    // Verify file versions
    const fileVersions = await page.$$('[data-testid="file-version"]');
    expect(fileVersions.length).toBeGreaterThan(0);
  });

  test('UI Usability and Navigation', async ({ page }) => {
    // Test dashboard navigation
    await page.click('[data-testid="calendar-view"]');
    expect(page.url()).toContain('/calendar');

    await page.click('[data-testid="task-list"]');
    expect(page.url()).toContain('/tasks');

    // Test responsive design
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile view
    await page.waitForSelector('[data-testid="mobile-menu"]');
    
    // Verify all important elements are visible
    await expect(page.locator('[data-testid="create-task-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-bell"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
  });
});

// Helper functions
async function fillTaskForm(page, taskData) {
  await page.fill('[data-testid="task-name"]', taskData.name);
  await page.selectOption('[data-testid="brand"]', taskData.brand);
  await page.selectOption('[data-testid="edition"]', taskData.edition);
  await page.selectOption('[data-testid="task-type"]', taskData.type);
  await page.click('[data-testid="submit-task"]');
}

async function createTestTaskWithHistory(page) {
  // Implementation of creating a test task with history
  // Returns taskId
}

async function loginUser(page, email, password) {
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForSelector('[data-testid="dashboard"]');
} 