const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // Map userId to WebSocket connection

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });
  }

  handleConnection(ws, req) {
    // Extract token from query string
    const token = new URL(req.url, 'ws://localhost').searchParams.get('token');
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      // Store connection
      this.clients.set(userId, ws);

      // Handle disconnection
      ws.on('close', () => {
        this.clients.delete(userId);
      });

      // Handle incoming messages
      ws.on('message', (message) => {
        this.handleMessage(userId, message);
      });

      // Send initial connection success
      ws.send(JSON.stringify({
        type: 'connection_established',
        message: 'Connected to notification service'
      }));

    } catch (error) {
      ws.close();
    }
  }

  handleMessage(userId, message) {
    try {
      const data = JSON.parse(message);
      // Handle different message types if needed
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  // Send notification to specific user
  sendToUser(userId, notification) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
  }

  // Send notification to multiple users
  sendToUsers(userIds, notification) {
    userIds.forEach(userId => {
      this.sendToUser(userId, notification);
    });
  }

  // Send notification to department
  sendToDepartment(department, notification) {
    this.clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          ...notification,
          department
        }));
      }
    });
  }

  // Broadcast to all connected clients
  broadcast(notification) {
    this.clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
      }
    });
  }
}

module.exports = WebSocketService; 