const Task = require('../models/Task');
const User = require('../models/User');
const NotificationController = require('../controllers/notificationController');

const MarketingFollowUp = {
  scheduleMarketingTask: async (reprintTask) => {
    try {
      // Store the scheduled marketing task creation time
      reprintTask.marketingTaskScheduled = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      await reprintTask.save();

      console.log(`Marketing task scheduled for ${reprintTask.marketingTaskScheduled} for task ${reprintTask._id}`);
    } catch (error) {
      console.error('Error scheduling marketing task:', error);
    }
  },

  checkMarketingTasks: async () => {
    try {
      const now = new Date();
      
      // Find completed reprint tasks that need marketing follow-up
      const reprintTasks = await Task.find({
        name: 'Prepare Reprints',
        status: 'completed',
        marketingTaskScheduled: { $lte: now },
        marketingTaskCreated: { $ne: true }
      }).populate('edition brand');

      for (const reprintTask of reprintTasks) {
        // Create marketing task
        const marketingTask = new Task({
          name: 'Prepare Twitter Marketing',
          type: 'Other',
          edition: reprintTask.edition._id,
          brand: reprintTask.brand._id,
          department: 'Design',
          status: 'created',
          priority: 'high',
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days deadline
          createdBy: reprintTask.createdBy
        });

        await marketingTask.save();

        // Find designers to notify
        const designers = await User.find({ department: 'Design' });

        // Notify designers
        for (const designer of designers) {
          await NotificationController.createNotification({
            recipient: designer._id,
            type: 'marketing_task_created',
            task: marketingTask._id,
            urgency: 'high',
            metadata: {
              editionName: reprintTask.edition.name,
              taskName: marketingTask.name
            }
          });
        }

        // Mark reprint task as marketing task created
        reprintTask.marketingTaskCreated = true;
        await reprintTask.save();

        console.log(`Marketing task created for reprint task ${reprintTask._id}`);
      }
    } catch (error) {
      console.error('Error checking marketing tasks:', error);
    }
  }
};

module.exports = MarketingFollowUp; 