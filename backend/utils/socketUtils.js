const { getIO } = require('../config/socket');

const notificationTypes = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_UPDATED: 'task_updated',
  APPROVAL_REQUIRED: 'approval_required',
  FEEDBACK_RECEIVED: 'feedback_received',
  TASK_COMPLETED: 'task_completed',
  FILE_UPLOADED: 'file_uploaded',
  EDITION_CREATED: 'edition_created',
  BRAND_UPDATED: 'brand_updated'
};

const sendNotification = async (recipientId, notification) => {
  try {
    const io = getIO();
    io.to(recipientId.toString()).emit('newNotification', notification);
  } catch (error) {
    console.error('Socket notification error:', error);
  }
};

const sendDepartmentNotification = async (departmentId, notification) => {
  try {
    const io = getIO();
    io.to(`department-${departmentId}`).emit('newNotification', notification);
  } catch (error) {
    console.error('Department socket notification error:', error);
  }
};

const broadcastTaskUpdate = async (taskData) => {
  try {
    const io = getIO();
    io.emit('taskUpdated', taskData);
  } catch (error) {
    console.error('Task broadcast error:', error);
  }
};

module.exports = {
  notificationTypes,
  sendNotification,
  sendDepartmentNotification,
  broadcastTaskUpdate
}; 