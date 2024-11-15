const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

module.exports = {
  init: (server) => {
    io = socketIO(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    io.use((socket, next) => {
      if (socket.handshake.auth && socket.handshake.auth.token) {
        jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) return next(new Error('Authentication error'));
          socket.user = decoded;
          next();
        });
      } else {
        next(new Error('Authentication error'));
      }
    });

    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.id}`);

      // Join user's personal room
      socket.join(`user_${socket.user.id}`);
      
      // Join department room
      if (socket.user.department) {
        socket.join(`department_${socket.user.department}`);
      }

      // Handle task updates
      socket.on('taskUpdate', (data) => {
        socket.to(`department_${data.department}`).emit('taskUpdated', data);
      });

      // Handle new comments
      socket.on('newComment', (data) => {
        socket.to(`task_${data.taskId}`).emit('commentAdded', data);
      });

      // Handle file uploads
      socket.on('fileUploaded', (data) => {
        socket.to(`task_${data.taskId}`).emit('newFile', data);
      });

      // Handle task assignments
      socket.on('taskAssigned', (data) => {
        socket.to(`user_${data.assignedTo}`).emit('newAssignment', data);
      });

      // Handle task status changes
      socket.on('statusChange', (data) => {
        socket.to(`task_${data.taskId}`).emit('statusUpdated', data);
      });

      // Join task room when viewing a task
      socket.on('joinTask', (taskId) => {
        socket.join(`task_${taskId}`);
      });

      // Leave task room
      socket.on('leaveTask', (taskId) => {
        socket.leave(`task_${taskId}`);
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.id}`);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },

  // Utility functions for emitting events
  emitToUser: (userId, event, data) => {
    io.to(`user_${userId}`).emit(event, data);
  },

  emitToDepartment: (department, event, data) => {
    io.to(`department_${department}`).emit(event, data);
  },

  emitToTask: (taskId, event, data) => {
    io.to(`task_${taskId}`).emit(event, data);
  },

  broadcastTaskUpdate: (taskId, data) => {
    io.to(`task_${taskId}`).emit('taskUpdated', data);
  },

  notifyAssignment: (userId, taskData) => {
    io.to(`user_${userId}`).emit('newAssignment', taskData);
  },

  notifyStatusChange: (taskId, statusData) => {
    io.to(`task_${taskId}`).emit('statusUpdated', statusData);
  },

  notifyNewComment: (taskId, commentData) => {
    io.to(`task_${taskId}`).emit('commentAdded', commentData);
  },

  notifyFileUpload: (taskId, fileData) => {
    io.to(`task_${taskId}`).emit('newFile', fileData);
  }
}; 