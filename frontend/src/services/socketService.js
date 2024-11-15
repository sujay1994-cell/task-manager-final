import io from 'socket.io-client';
import { getAuthToken } from './authService';

let socket;

export const initializeSocket = (departmentId) => {
  const token = getAuthToken();
  
  socket = io(process.env.REACT_APP_API_URL, {
    auth: {
      token,
      departmentId
    }
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export const subscribeToNotifications = (callback) => {
  if (!socket) return;
  
  socket.on('newNotification', (notification) => {
    callback(notification);
  });
};

export const subscribeToTaskUpdates = (callback) => {
  if (!socket) return;
  
  socket.on('taskUpdated', (taskData) => {
    callback(taskData);
  });
};

export const subscribeToEditionUpdates = (callback) => {
  if (!socket) return;
  
  socket.on('editionUpdated', (editionData) => {
    callback(editionData);
  });
};

export const emitTaskUpdate = (taskData) => {
  if (!socket) return;
  socket.emit('taskUpdate', taskData);
};

export const emitEditionUpdate = (editionData) => {
  if (!socket) return;
  socket.emit('editionUpdate', editionData);
}; 