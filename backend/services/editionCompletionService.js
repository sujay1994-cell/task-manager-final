const Edition = require('../models/Edition');
const Task = require('../models/Task');
const User = require('../models/User');
const NotificationController = require('../controllers/notificationController');

const EditionCompletionService = {
  completeEdition: async (editionId, printTaskId, designerId, comments) => {
    try {
      const edition = await Edition.findById(editionId);
      if (!edition) {
        throw new Error('Edition not found');
      }

      const printTask = await Task.findById(printTaskId);
      if (!printTask || printTask.status !== 'completed') {
        throw new Error('Print task must be completed before sign-off');
      }

      // Update edition status and sign-off details
      edition.status = 'completed';
      edition.signOff = {
        designerSignOff: {
          signedBy: designerId,
          signedAt: new Date(),
          comments
        },
        completedAt: new Date()
      };

      // Mark all remaining tasks as completed
      await Task.updateMany(
        { 
          edition: editionId,
          status: { $ne: 'completed' }
        },
        { 
          status: 'completed',
          updatedAt: new Date()
        }
      );

      // Archive the edition after 24 hours
      setTimeout(async () => {
        try {
          edition.status = 'archived';
          edition.signOff.archivedAt = new Date();
          await edition.save();

          // Notify relevant team members
          const teamMembers = await User.find({
            department: { $in: ['Sales', 'Editorial', 'Design'] }
          });

          for (const member of teamMembers) {
            await NotificationController.createNotification({
              recipient: member._id,
              type: 'edition_archived',
              edition: edition._id,
              urgency: 'low',
              metadata: {
                editionName: edition.name,
                brandName: edition.brand.name
              }
            });
          }
        } catch (error) {
          console.error('Error archiving edition:', error);
        }
      }, 24 * 60 * 60 * 1000); // 24 hours

      await edition.save();

      // Notify team members of completion
      const teamMembers = await User.find({
        department: { $in: ['Sales', 'Editorial', 'Design'] }
      });

      for (const member of teamMembers) {
        await NotificationController.createNotification({
          recipient: member._id,
          type: 'edition_completed',
          edition: edition._id,
          urgency: 'medium',
          metadata: {
            editionName: edition.name,
            brandName: edition.brand.name,
            designerName: (await User.findById(designerId)).name
          }
        });
      }

      return edition;
    } catch (error) {
      console.error('Error completing edition:', error);
      throw error;
    }
  }
};

module.exports = EditionCompletionService; 