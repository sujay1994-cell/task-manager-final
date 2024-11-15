const Task = require('../models/Task');
const Edition = require('../models/Edition');
const { createNotification } = require('../utils/notificationUtils');
const { scheduleTask } = require('../utils/schedulerUtils');
const socket = require('../config/socket');

class AutomatedTaskTracker {
  constructor() {
    this.taskQueue = new Map();
    this.processInterval = 5 * 60 * 1000; // 5 minutes
    this.init();
  }

  init() {
    setInterval(() => this.processQueue(), this.processInterval);
  }

  async trackEdition(editionId) {
    try {
      const edition = await Edition.findById(editionId)
        .populate('brand')
        .populate('tasks');

      this.taskQueue.set(editionId, {
        edition,
        status: 'tracking',
        lastChecked: new Date(),
        automatedTasks: []
      });

      return true;
    } catch (error) {
      console.error('Error tracking edition:', error);
      return false;
    }
  }

  async processQueue() {
    for (const [editionId, data] of this.taskQueue) {
      try {
        await this.checkEditionStatus(editionId, data);
      } catch (error) {
        console.error(`Error processing edition ${editionId}:`, error);
      }
    }
  }

  async checkEditionStatus(editionId, data) {
    const { edition, automatedTasks } = data;
    const completedTasks = edition.tasks.filter(t => t.status === 'completed');
    
    // Check if all regular tasks are completed
    if (completedTasks.length === edition.tasks.length) {
      await this.schedulePostLaunchTasks(edition);
      this.taskQueue.delete(editionId);
    }

    // Check automated tasks progress
    for (const task of automatedTasks) {
      if (task.status === 'completed') {
        await this.handleAutomatedTaskCompletion(edition, task);
      }
    }
  }

  async schedulePostLaunchTasks(edition) {
    const reprints = await this.createAutomatedTask(edition, {
      name: 'Prepare Reprints',
      type: 'Reprints',
      department: 'design',
      delay: 48 // hours
    });

    const marketing = await this.createAutomatedTask(edition, {
      name: 'Prepare Twitter Marketing',
      type: 'Marketing',
      department: 'design',
      delay: 72 // hours
    });

    this.taskQueue.get(edition._id).automatedTasks = [reprints, marketing];
  }

  async createAutomatedTask(edition, { name, type, department, delay }) {
    const task = new Task({
      name,
      type,
      department,
      brand: edition.brand._id,
      edition: edition._id,
      status: 'pending',
      priority: 'high',
      automated: true
    });

    await task.save();

    // Schedule task creation notification
    await scheduleTask({
      date: new Date(Date.now() + delay * 60 * 60 * 1000),
      task: {
        type: 'CREATE_TASK',
        data: {
          taskId: task._id,
          name,
          department
        }
      }
    });

    return task;
  }

  async handleAutomatedTaskCompletion(edition, task) {
    switch (task.name) {
      case 'Prepare Reprints':
        await this.handleReprintsCompletion(edition);
        break;
      case 'Prepare Twitter Marketing':
        await this.handleMarketingCompletion(edition);
        break;
      case 'Generate Print':
        await this.handlePrintCompletion(edition);
        break;
    }
  }

  async handleReprintsCompletion(edition) {
    // Schedule Twitter Marketing task
    await this.createAutomatedTask(edition, {
      name: 'Prepare Twitter Marketing',
      type: 'Marketing',
      department: 'design',
      delay: 24
    });
  }

  async handleMarketingCompletion(edition) {
    // Notify managers for print approval
    await createNotification({
      type: 'PRINT_APPROVAL_REQUIRED',
      title: 'Print Approval Required',
      message: `Please approve print for ${edition.brand.name} > ${edition.name}`,
      recipients: ['sales_manager', 'editorial_manager'],
      data: { editionId: edition._id }
    });
  }

  async handlePrintCompletion(edition) {
    edition.status = 'signed_off';
    await edition.save();

    // Notify all managers
    await createNotification({
      type: 'EDITION_COMPLETED',
      title: 'Edition Completed',
      message: `${edition.brand.name} > ${edition.name} has been completed`,
      recipients: ['sales_manager', 'editorial_manager', 'design_manager'],
      data: { editionId: edition._id }
    });

    // Remove from tracking queue
    this.taskQueue.delete(edition._id);
  }
}

module.exports = new AutomatedTaskTracker(); 