const Edition = require('../models/Edition');
const Task = require('../models/Task');
const User = require('../models/User');
const NotificationController = require('../controllers/notificationController');

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const addBusinessDays = (date, days) => {
  let currentDate = new Date(date);
  let remainingDays = days;

  while (remainingDays > 0) {
    currentDate.setDate(currentDate.getDate() + 1);
    if (!isWeekend(currentDate)) {
      remainingDays--;
    }
  }

  return currentDate;
};

const ReprintMonitor = {
  scheduleReprintNotification: async (edition) => {
    try {
      // Calculate notification date (48 hours excluding weekends)
      const launchDate = new Date(edition.launchDate);
      const notificationDate = addBusinessDays(launchDate, 2);

      // Store the scheduled notification in the edition
      edition.reprintNotificationScheduled = notificationDate;
      await edition.save();

      console.log(`Reprint notification scheduled for ${notificationDate} for edition ${edition._id}`);
    } catch (error) {
      console.error('Error scheduling reprint notification:', error);
    }
  },

  checkReprintNotifications: async () => {
    try {
      const now = new Date();
      
      // Find editions that need reprint notifications
      const editions = await Edition.find({
        status: 'launched',
        reprintNotificationScheduled: { $lte: now },
        reprintNotified: { $ne: true }
      });

      for (const edition of editions) {
        // Find design team members
        const designers = await User.find({ department: 'Design' });

        // Create reprint task
        const reprintTask = new Task({
          name: 'Prepare Reprints',
          type: 'Other',
          edition: edition._id,
          brand: edition.brand,
          department: 'Design',
          status: 'created',
          priority: 'high',
          deadline: addBusinessDays(now, 5), // Set deadline 5 business days from now
          createdBy: edition.launchRequestedBy || edition.createdBy
        });

        await reprintTask.save();

        // Notify designers
        for (const designer of designers) {
          await NotificationController.createNotification({
            recipient: designer._id,
            type: 'reprint_required',
            task: reprintTask._id,
            edition: edition._id,
            urgency: 'high',
            metadata: {
              taskId: reprintTask._id,
              editionName: edition.name
            }
          });
        }

        // Mark edition as reprint notified
        edition.reprintNotified = true;
        await edition.save();

        console.log(`Reprint notification sent for edition ${edition._id}`);
      }
    } catch (error) {
      console.error('Error checking reprint notifications:', error);
    }
  }
};

module.exports = ReprintMonitor; 