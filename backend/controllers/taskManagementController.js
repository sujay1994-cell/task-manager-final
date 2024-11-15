const Task = require('../models/Task');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationUtils');
const socket = require('../config/socket');

const taskManagementController = {
  // Accept task from previous department
  acceptTask: async (req, res) => {
    try {
      const { taskId } = req.params;
      const { assignTo, comment } = req.body;

      const task = await Task.findById(taskId)
        .populate('brand')
        .populate('edition');

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Update task status and assignment
      task.status = 'in_progress';
      task.assignedTo = assignTo;
      task.currentDepartment = req.user.department;
      
      // Add to history
      task.history.push({
        action: 'TASK_ACCEPTED',
        user: req.user.id,
        details: `Task accepted by ${req.user.department} department`,
        comment: comment || ''
      });

      await task.save();

      // Notify assigned team member
      await createNotification({
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: `You have been assigned to ${task.brand.name} > ${task.edition.name} > ${task.name}`,
        recipients: [assignTo],
        data: { taskId: task._id }
      });

      // Real-time update
      socket.getIO().to(`task_${taskId}`).emit('taskAccepted', {
        taskId,
        acceptedBy: req.user.id,
        assignedTo: assignTo
      });

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Error accepting task' });
    }
  },

  // Reassign task to different team member
  reassignTask: async (req, res) => {
    try {
      const { taskId } = req.params;
      const { newAssignee, reason } = req.body;

      const task = await Task.findById(taskId)
        .populate('brand')
        .populate('edition');

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const previousAssignee = task.assignedTo;
      task.assignedTo = newAssignee;
      
      task.history.push({
        action: 'TASK_REASSIGNED',
        user: req.user.id,
        details: `Task reassigned to new team member`,
        comment: reason
      });

      await task.save();

      // Notify both previous and new assignees
      await Promise.all([
        createNotification({
          type: 'TASK_REASSIGNED',
          title: 'Task Reassigned',
          message: `Task has been reassigned to another team member`,
          recipients: [previousAssignee],
          data: { taskId: task._id }
        }),
        createNotification({
          type: 'TASK_ASSIGNED',
          title: 'New Task Assigned',
          message: `You have been assigned to ${task.brand.name} > ${task.edition.name} > ${task.name}`,
          recipients: [newAssignee],
          data: { taskId: task._id }
        })
      ]);

      socket.getIO().to(`task_${taskId}`).emit('taskReassigned', {
        taskId,
        previousAssignee,
        newAssignee,
        reassignedBy: req.user.id
      });

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Error reassigning task' });
    }
  },

  // Review uploaded work
  reviewWork: async (req, res) => {
    try {
      const { taskId } = req.params;
      const { status, feedback, requestChanges } = req.body;

      const task = await Task.findById(taskId)
        .populate('assignedTo')
        .populate('brand')
        .populate('edition');

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      task.status = status;
      task.history.push({
        action: requestChanges ? 'CHANGES_REQUESTED' : 'WORK_REVIEWED',
        user: req.user.id,
        details: requestChanges ? 'Changes requested' : 'Work reviewed',
        comment: feedback
      });

      await task.save();

      // Notify team member
      await createNotification({
        type: requestChanges ? 'CHANGES_REQUESTED' : 'WORK_REVIEWED',
        title: requestChanges ? 'Changes Requested' : 'Work Reviewed',
        message: feedback,
        recipients: [task.assignedTo._id],
        data: { taskId: task._id }
      });

      socket.getIO().to(`task_${taskId}`).emit('workReviewed', {
        taskId,
        status,
        reviewedBy: req.user.id,
        requestChanges
      });

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Error reviewing work' });
    }
  },

  // Send task back to previous department
  returnTask: async (req, res) => {
    try {
      const { taskId } = req.params;
      const { reason, files } = req.body;

      const task = await Task.findById(taskId)
        .populate('brand')
        .populate('edition');

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Determine previous department
      const departmentFlow = {
        sales: null,
        editorial: 'sales',
        design: 'editorial'
      };

      const previousDepartment = departmentFlow[task.currentDepartment];
      if (!previousDepartment) {
        return res.status(400).json({ message: 'Cannot return task from this department' });
      }

      task.currentDepartment = previousDepartment;
      task.status = 'review_required';
      
      task.history.push({
        action: 'TASK_RETURNED',
        user: req.user.id,
        details: `Task returned to ${previousDepartment} department`,
        comment: reason
      });

      // Handle new file uploads if any
      if (files && files.length > 0) {
        const newFiles = files.map(file => ({
          ...file,
          uploadedBy: req.user.id,
          uploadedAt: new Date()
        }));
        task.files.push(...newFiles);
      }

      await task.save();

      // Notify previous department manager
      await createNotification({
        type: 'TASK_RETURNED',
        title: 'Task Returned',
        message: `Task returned from ${req.user.department}: ${task.brand.name} > ${task.edition.name} > ${task.name}`,
        recipients: ['manager'],
        department: previousDepartment,
        data: { taskId: task._id }
      });

      socket.getIO().to(`task_${taskId}`).emit('taskReturned', {
        taskId,
        returnedBy: req.user.id,
        toDepartment: previousDepartment
      });

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Error returning task' });
    }
  }
};

module.exports = taskManagementController; 