const Task = require('../models/Task');
const Edition = require('../models/Edition');
const { createNotification } = require('../utils/notificationUtils');
const { scheduleTask } = require('../utils/schedulerUtils');
const socket = require('../config/socket');

const launchController = {
  // Request magazine launch
  requestLaunch: async (req, res) => {
    try {
      const { editionId } = req.params;
      const { launchDate, notes } = req.body;

      const edition = await Edition.findById(editionId)
        .populate('brand')
        .populate({
          path: 'tasks',
          select: 'status'
        });

      // Check if all tasks are completed
      const incompleteTasks = edition.tasks.filter(task => task.status !== 'completed');
      if (incompleteTasks.length > 0) {
        return res.status(400).json({
          message: 'Cannot request launch. Some tasks are still incomplete.',
          incompleteTasks: incompleteTasks.length
        });
      }

      // Update edition status
      edition.status = 'launch_requested';
      edition.launchDate = launchDate;
      edition.launchNotes = notes;
      edition.launchRequestedBy = req.user.id;
      edition.launchRequestedAt = new Date();

      await edition.save();

      // Notify managers
      await Promise.all([
        createNotification({
          type: 'LAUNCH_REQUESTED',
          title: 'Magazine Launch Requested',
          message: `Launch requested for ${edition.brand.name} > ${edition.name}`,
          recipients: ['editorial_manager', 'design_manager'],
          data: {
            editionId,
            launchDate,
            brandName: edition.brand.name,
            editionName: edition.name
          },
          urgent: true
        }),
        // Add to managers' calendars
        createCalendarEvent({
          title: `Magazine Launch: ${edition.brand.name} - ${edition.name}`,
          date: launchDate,
          recipients: ['editorial_manager', 'design_manager'],
          details: notes
        })
      ]);

      // Schedule automated tasks
      scheduleAutomatedTasks(edition, launchDate);

      // Real-time notification
      socket.getIO().emit('launchRequested', {
        editionId,
        brandName: edition.brand.name,
        editionName: edition.name,
        launchDate
      });

      res.json(edition);
    } catch (error) {
      res.status(500).json({ message: 'Error requesting launch' });
    }
  },

  // Schedule automated post-launch tasks
  scheduleAutomatedTasks: async (edition, launchDate) => {
    try {
      const workingDays = (days) => {
        let date = new Date(launchDate);
        let workdays = 0;
        while (workdays < days) {
          date.setDate(date.getDate() + 1);
          if (date.getDay() !== 0 && date.getDay() !== 6) {
            workdays++;
          }
        }
        return date;
      };

      // Schedule "Prepare Reprints" task
      const reprintsDate = workingDays(2); // 48 hours excluding weekends
      await scheduleTask({
        date: reprintsDate,
        task: {
          type: 'CREATE_TASK',
          data: {
            name: 'Prepare Reprints',
            brand: edition.brand._id,
            edition: edition._id,
            department: 'design',
            type: 'Reprints',
            priority: 'high',
            deadline: workingDays(3)
          }
        }
      });

      // Schedule "Prepare Twitter Marketing" task
      const marketingDate = workingDays(3); // 24 hours after reprints
      await scheduleTask({
        date: marketingDate,
        task: {
          type: 'CREATE_TASK',
          data: {
            name: 'Prepare Twitter Marketing',
            brand: edition.brand._id,
            edition: edition._id,
            department: 'design',
            type: 'Marketing',
            priority: 'high',
            deadline: workingDays(4)
          }
        }
      });
    } catch (error) {
      console.error('Error scheduling automated tasks:', error);
    }
  },

  // Request print approval
  requestPrintApproval: async (req, res) => {
    try {
      const { editionId } = req.params;
      const { comments } = req.body;

      const edition = await Edition.findById(editionId)
        .populate('brand');

      edition.printApprovalStatus = {
        requested: true,
        requestedBy: req.user.id,
        requestedAt: new Date(),
        salesApproval: false,
        editorialApproval: false,
        comments
      };

      await edition.save();

      // Notify managers
      await createNotification({
        type: 'PRINT_APPROVAL_REQUESTED',
        title: 'Print Approval Required',
        message: `Print approval requested for ${edition.brand.name} > ${edition.name}`,
        recipients: ['sales_manager', 'editorial_manager'],
        data: { editionId },
        urgent: true
      });

      res.json(edition);
    } catch (error) {
      res.status(500).json({ message: 'Error requesting print approval' });
    }
  },

  // Approve print request
  approvePrint: async (req, res) => {
    try {
      const { editionId } = req.params;
      const { department } = req.user;

      const edition = await Edition.findById(editionId)
        .populate('brand');

      if (department === 'sales') {
        edition.printApprovalStatus.salesApproval = true;
      } else if (department === 'editorial') {
        edition.printApprovalStatus.editorialApproval = true;
      }

      await edition.save();

      // If both approved, create Generate Print task
      if (edition.printApprovalStatus.salesApproval && 
          edition.printApprovalStatus.editorialApproval) {
        
        // Create Generate Print task
        const task = new Task({
          name: 'Generate Print',
          brand: edition.brand._id,
          edition: edition._id,
          department: 'design',
          type: 'Print',
          priority: 'high',
          status: 'pending',
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });

        await task.save();

        // Update edition status
        edition.status = 'print_approved';
        await edition.save();

        // Notify design team
        await createNotification({
          type: 'PRINT_TASK_CREATED',
          title: 'New Print Task',
          message: `Generate Print task created for ${edition.brand.name} > ${edition.name}`,
          recipients: ['design_manager'],
          data: { taskId: task._id },
          urgent: true
        });
      }

      res.json(edition);
    } catch (error) {
      res.status(500).json({ message: 'Error approving print request' });
    }
  },

  // Mark edition as signed off
  signOffEdition: async (req, res) => {
    try {
      const { editionId } = req.params;
      const { comments } = req.body;

      const edition = await Edition.findById(editionId)
        .populate('brand');

      edition.status = 'signed_off';
      edition.signedOffBy = req.user.id;
      edition.signedOffAt = new Date();
      edition.signOffComments = comments;

      await edition.save();

      // Notify all managers
      await createNotification({
        type: 'EDITION_SIGNED_OFF',
        title: 'Edition Signed Off',
        message: `${edition.brand.name} > ${edition.name} has been signed off`,
        recipients: ['sales_manager', 'editorial_manager', 'design_manager'],
        data: { editionId }
      });

      res.json(edition);
    } catch (error) {
      res.status(500).json({ message: 'Error signing off edition' });
    }
  }
};

module.exports = launchController; 