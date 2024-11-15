const cron = require('node-cron');
const Task = require('../models/Task');
const { createNotification } = require('./notificationUtils');

// Store scheduled tasks in memory
const scheduledTasks = new Map();

const schedulerUtils = {
  // Schedule a task
  scheduleTask: async ({ date, task }) => {
    try {
      const timestamp = new Date(date).getTime();
      const now = Date.now();

      // If scheduled time is in the past, execute immediately
      if (timestamp <= now) {
        return await executeTask(task);
      }

      // Calculate cron expression
      const cronExpression = getCronExpression(date);
      
      // Schedule task
      const scheduledTask = cron.schedule(cronExpression, async () => {
        await executeTask(task);
        scheduledTask.destroy(); // Cleanup after execution
      });

      // Store reference
      const taskId = `${task.type}_${timestamp}`;
      scheduledTasks.set(taskId, scheduledTask);

      return taskId;
    } catch (error) {
      console.error('Error scheduling task:', error);
      throw error;
    }
  },

  // Cancel scheduled task
  cancelScheduledTask: (taskId) => {
    const scheduledTask = scheduledTasks.get(taskId);
    if (scheduledTask) {
      scheduledTask.destroy();
      scheduledTasks.delete(taskId);
      return true;
    }
    return false;
  },

  // Get all scheduled tasks
  getScheduledTasks: () => {
    return Array.from(scheduledTasks.keys());
  },

  // Check if date is a working day
  isWorkingDay: (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // Not Sunday(0) or Saturday(6)
  },

  // Get next working day
  getNextWorkingDay: (date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    while (!schedulerUtils.isWorkingDay(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    return nextDay;
  },

  // Calculate working days between dates
  getWorkingDaysBetween: (startDate, endDate) => {
    let workingDays = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (schedulerUtils.isWorkingDay(currentDate)) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }
};

// Helper function to execute scheduled task
const executeTask = async (task) => {
  try {
    switch (task.type) {
      case 'CREATE_TASK':
        const newTask = new Task(task.data);
        await newTask.save();

        // Notify relevant users
        await createNotification({
          type: 'AUTOMATED_TASK_CREATED',
          title: 'New Automated Task Created',
          message: `New task created: ${task.data.name}`,
          recipients: ['design_manager'],
          data: { taskId: newTask._id }
        });
        break;

      case 'SEND_REMINDER':
        await createNotification({
          type: 'TASK_REMINDER',
          title: 'Task Reminder',
          message: task.data.message,
          recipients: task.data.recipients,
          data: task.data
        });
        break;

      // Add more task types as needed
    }
  } catch (error) {
    console.error('Error executing scheduled task:', error);
    throw error;
  }
};

// Helper function to generate cron expression
const getCronExpression = (date) => {
  const d = new Date(date);
  return `${d.getMinutes()} ${d.getHours()} ${d.getDate()} ${d.getMonth() + 1} *`;
};

module.exports = schedulerUtils; 