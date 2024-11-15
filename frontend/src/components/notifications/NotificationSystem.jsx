import React, { useState, useEffect, useCallback } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  Button,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  Assignment as TaskIcon,
  Edit as EditIcon,
  CheckCircle as ApproveIcon,
  Warning as UrgentIcon,
  Upload as UploadIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';

const NotificationSystem = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Initialize socket connection
  const socket = io(process.env.REACT_APP_SOCKET_URL, {
    auth: {
      token: localStorage.getItem('token')
    }
  });

  useEffect(() => {
    fetchNotifications();
    setupSocketListeners();

    return () => {
      socket.disconnect();
    };
  }, []);

  const setupSocketListeners = () => {
    socket.on('newNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      showBrowserNotification(notification);
    });

    socket.on('taskUpdate', (update) => {
      if (update.assignedTo === user.id || update.department === user.department) {
        fetchNotifications();
      }
    });
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const showBrowserNotification = (notification) => {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo192.png'
      });
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      await axios.put(`/api/notifications/${notification._id}/read`);
      
      // Update local state
      setNotifications(notifications.map(n => 
        n._id === notification._id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Navigate based on notification type
      if (notification.taskId) {
        navigate(`/tasks/${notification.taskId}`);
      } else if (notification.editionId) {
        navigate(`/editions/${notification.editionId}`);
      }
      
      setOpen(false);
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return <TaskIcon color="primary" />;
      case 'TASK_UPDATED':
        return <EditIcon color="info" />;
      case 'TASK_APPROVED':
        return <ApproveIcon color="success" />;
      case 'URGENT':
        return <UrgentIcon color="error" />;
      case 'FILE_UPLOADED':
        return <UploadIcon color="secondary" />;
      case 'COMMENT':
        return <CommentIcon color="action" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return 'just now';
  };

  return (
    <>
      <IconButton color="inherit" onClick={() => setOpen(true)}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Notifications
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                color="primary"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <Box>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={markAllAsRead}
                sx={{ mr: 1 }}
              >
                Mark all as read
              </Button>
            )}
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider />

        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No notifications"
                secondary="You're all caught up!"
              />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <React.Fragment key={notification._id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.read ? 'inherit' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'background.paper' }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          component="div"
                          variant="caption"
                          color="text.secondary"
                        >
                          {getTimeAgo(notification.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                  {notification.urgent && (
                    <Chip
                      label="Urgent"
                      color="error"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          )}
        </List>
      </Drawer>
    </>
  );
};

export default NotificationSystem; 