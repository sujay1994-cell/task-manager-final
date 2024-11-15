import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  Badge,
  Divider,
  Button,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Assignment as TaskIcon,
  Edit as EditIcon,
  CheckCircle as ApproveIcon,
  Feedback as FeedbackIcon,
  Upload as UploadIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NotificationPanel = ({ open, onClose, notifications, onNotificationRead }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return <TaskIcon color="primary" />;
      case 'TASK_UPDATED':
        return <EditIcon color="info" />;
      case 'TASK_APPROVED':
        return <ApproveIcon color="success" />;
      case 'FEEDBACK_REQUIRED':
        return <FeedbackIcon color="warning" />;
      case 'FILE_UPLOADED':
        return <UploadIcon color="secondary" />;
      case 'TASK_OVERDUE':
        return <WarningIcon color="error" />;
      default:
        return <TaskIcon />;
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await axios.put(`/api/notifications/${notification._id}/read`);
        onNotificationRead();
      }

      // Navigate based on notification type
      if (notification.taskId) {
        navigate(`/tasks/${notification.taskId}`);
      } else if (notification.editionId) {
        navigate(`/editions/${notification.editionId}`);
      }
      
      onClose();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      onNotificationRead();
    } catch (error) {
      console.error('Error clearing notifications:', error);
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
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Badge 
              badgeContent={unreadCount} 
              color="error" 
              sx={{ ml: 2 }}
            />
          )}
        </Box>
        <Box>
          <Tooltip title="Clear All">
            <IconButton 
              onClick={handleClearAll}
              disabled={unreadCount === 0}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Divider />

      <List sx={{ pt: 0, pb: 2 }}>
        {notifications.length === 0 ? (
          <ListItem>
            <ListItemText 
              primary="No notifications"
              secondary="You're all caught up!"
              sx={{ textAlign: 'center' }}
            />
          </ListItem>
        ) : (
          notifications.map((notification) => (
            <React.Fragment key={notification._id}>
              <ListItem
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  backgroundColor: notification.read ? 'inherit' : 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected'
                  }
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
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {notification.message}
                      </Typography>
                      <br />
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {getTimeAgo(notification.createdAt)}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))
        )}
      </List>
    </Drawer>
  );
};

export default NotificationPanel; 