const Task = require('../models/Task');
const User = require('../models/User');
const Edition = require('../models/Edition');
const NotificationController = require('../controllers/notificationController');

const PrintApprovalService = {
  schedulePrintApproval: async (marketingTask) => {
    try {
      // Set timer for 48 hours
      marketingTask.printApprovalScheduled = new Date(Date.now() + 48 * 60 * 60 * 1000);
      await marketingTask.save();

      console.log(`Print approval scheduled for ${marketingTask.printApprovalScheduled}`);
    } catch (error) {
      console.error('Error scheduling print approval:', error);
    }
  },

  checkPrintApprovals: async () => {
    try {
      const now = new Date();
      
      // Find completed marketing tasks ready for print approval
      const marketingTasks = await Task.find({
        name: 'Prepare Twitter Marketing',
        status: 'completed',
        printApprovalScheduled: { $lte: now },
        printApprovalInitiated: { $ne: true }
      }).populate('edition brand');

      for (const task of marketingTasks) {
        // Create print approval request
        const approvalRequest = {
          editionId: task.edition._id,
          salesApproved: false,
          editorialApproved: false,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days to approve
        };

        // Store approval request in edition
        const edition = await Edition.findById(task.edition._id);
        edition.printApprovalRequest = approvalRequest;
        await edition.save();

        // Notify Sales and Editorial teams
        const salesTeam = await User.find({ department: 'Sales' });
        const editorialTeam = await User.find({ department: 'Editorial' });

        const notifyTeam = async (team) => {
          for (const member of team) {
            await NotificationController.createNotification({
              recipient: member._id,
              type: 'print_approval_required',
              task: task._id,
              edition: edition._id,
              urgency: 'high',
              metadata: {
                editionName: edition.name,
                brandName: task.brand.name,
                approvalType: member.department.toLowerCase()
              }
            });
          }
        };

        await Promise.all([
          notifyTeam(salesTeam),
          notifyTeam(editorialTeam)
        ]);

        // Mark task as print approval initiated
        task.printApprovalInitiated = true;
        await task.save();

        console.log(`Print approval process initiated for edition ${edition._id}`);
      }
    } catch (error) {
      console.error('Error checking print approvals:', error);
    }
  },

  handleApproval: async (editionId, department, approved) => {
    try {
      const edition = await Edition.findById(editionId);
      if (!edition.printApprovalRequest) {
        throw new Error('No print approval request found');
      }

      // Update approval status
      if (department === 'Sales') {
        edition.printApprovalRequest.salesApproved = approved;
      } else if (department === 'Editorial') {
        edition.printApprovalRequest.editorialApproved = approved;
      }

      // Check if both teams have approved
      if (edition.printApprovalRequest.salesApproved && 
          edition.printApprovalRequest.editorialApproved) {
        // Create print task for designer
        const printTask = new Task({
          name: `Generate Print ${edition.brand.name} > ${edition.name}`,
          type: 'Other',
          edition: edition._id,
          brand: edition.brand._id,
          department: 'Design',
          status: 'created',
          priority: 'high',
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days deadline
          createdBy: edition.createdBy
        });

        await printTask.save();

        // Notify design team
        const designers = await User.find({ department: 'Design' });
        for (const designer of designers) {
          await NotificationController.createNotification({
            recipient: designer._id,
            type: 'print_task_created',
            task: printTask._id,
            edition: edition._id,
            urgency: 'high',
            metadata: {
              editionName: edition.name,
              brandName: edition.brand.name
            }
          });
        }

        // Clear approval request
        edition.printApprovalRequest = null;
        edition.status = 'print-approved';
      }

      await edition.save();
      return edition;
    } catch (error) {
      console.error('Error handling print approval:', error);
      throw error;
    }
  }
};

module.exports = PrintApprovalService; 