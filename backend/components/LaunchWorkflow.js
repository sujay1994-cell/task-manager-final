const Edition = require('../models/Edition');
const Task = require('../models/Task');
const AutomatedTaskTracker = require('./AutomatedTaskTracker');
const { createNotification } = require('../utils/notificationUtils');
const { createCalendarEvent } = require('../utils/calendarUtils');
const socket = require('../config/socket');

class LaunchWorkflow {
  constructor() {
    this.workflowSteps = [
      'tasks_completed',
      'launch_requested',
      'reprints_prepared',
      'marketing_prepared',
      'print_approved',
      'print_generated',
      'signed_off'
    ];
  }

  async initiateLaunch(editionId, launchData) {
    try {
      const edition = await Edition.findById(editionId)
        .populate('brand')
        .populate('tasks');

      // Verify all tasks are completed
      const incompleteTasks = edition.tasks.filter(task => task.status !== 'completed');
      if (incompleteTasks.length > 0) {
        throw new Error('All tasks must be completed before launch');
      }

      // Update edition status
      edition.launchStatus = {
        currentStep: 'launch_requested',
        requestedBy: launchData.requestedBy,
        requestedAt: new Date(),
        launchDate: launchData.launchDate,
        notes: launchData.notes
      };

      await edition.save();

      // Create calendar events
      await this.createLaunchEvents(edition, launchData);

      // Start automated task tracking
      await AutomatedTaskTracker.trackEdition(editionId);

      // Notify relevant departments
      await this.notifyDepartments(edition, 'launch_requested');

      return edition;
    } catch (error) {
      console.error('Error initiating launch:', error);
      throw error;
    }
  }

  async createLaunchEvents(edition, launchData) {
    const events = [
      {
        title: `Magazine Launch: ${edition.brand.name} - ${edition.name}`,
        date: launchData.launchDate,
        recipients: ['sales_manager', 'editorial_manager', 'design_manager'],
        details: launchData.notes
      },
      {
        title: 'Prepare Reprints',
        date: this.getWorkingDayOffset(launchData.launchDate, 2),
        recipients: ['design_manager'],
        details: `Prepare reprints for ${edition.brand.name} - ${edition.name}`
      },
      {
        title: 'Marketing Materials',
        date: this.getWorkingDayOffset(launchData.launchDate, 3),
        recipients: ['design_manager'],
        details: `Prepare marketing materials for ${edition.brand.name} - ${edition.name}`
      }
    ];

    await Promise.all(events.map(event => createCalendarEvent(event)));
  }

  async progressToNextStep(editionId) {
    const edition = await Edition.findById(editionId);
    const currentIndex = this.workflowSteps.indexOf(edition.launchStatus.currentStep);
    const nextStep = this.workflowSteps[currentIndex + 1];

    if (nextStep) {
      edition.launchStatus.currentStep = nextStep;
      edition.launchStatus[`${nextStep}At`] = new Date();
      await edition.save();

      await this.notifyDepartments(edition, nextStep);
      return true;
    }
    return false;
  }

  async notifyDepartments(edition, step) {
    const notifications = {
      launch_requested: {
        recipients: ['editorial_manager', 'design_manager'],
        title: 'Magazine Launch Requested',
        message: `Launch requested for ${edition.brand.name} - ${edition.name}`
      },
      reprints_prepared: {
        recipients: ['sales_manager'],
        title: 'Reprints Ready',
        message: `Reprints prepared for ${edition.brand.name} - ${edition.name}`
      },
      marketing_prepared: {
        recipients: ['sales_manager'],
        title: 'Marketing Materials Ready',
        message: `Marketing materials prepared for ${edition.brand.name} - ${edition.name}`
      },
      print_approved: {
        recipients: ['design_manager'],
        title: 'Print Approved',
        message: `Print approved for ${edition.brand.name} - ${edition.name}`
      },
      signed_off: {
        recipients: ['sales_manager', 'editorial_manager', 'design_manager'],
        title: 'Edition Signed Off',
        message: `${edition.brand.name} - ${edition.name} has been signed off`
      }
    };

    const notification = notifications[step];
    if (notification) {
      await createNotification({
        ...notification,
        data: { editionId: edition._id }
      });

      // Emit socket event
      socket.getIO().emit('launchUpdate', {
        editionId: edition._id,
        step,
        timestamp: new Date()
      });
    }
  }

  getWorkingDayOffset(date, days) {
    let result = new Date(date);
    let addedDays = 0;

    while (addedDays < days) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        addedDays++;
      }
    }

    return result;
  }
}

module.exports = new LaunchWorkflow(); 