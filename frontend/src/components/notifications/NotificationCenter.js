import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  IconButton,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Comment as CommentIcon,
  AccessTime as DeadlineIcon
} from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Fetch notifications from API
    const mockNotifications = [
      {
        id: 1,
        type: 'task_assigned',
        message: 'New task assigned: Review Article',
        read: false,
        createdAt: new Date()
      },
      {
        id: 2,
        type: 'comment_added',
        message: 'New comment on "Magazine Cover"',
        read: false,
        createdAt: new Date()
      },
      {
        id: 3,
        type: 'deadline_approaching',
        message: 'Deadline approaching: Sales Report',
        read: true,
        createdAt: new Date()
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return <TaskIcon color="primary" />;
      case 'comment_added':
        return <CommentIcon color="info" />;
      case 'deadline_approaching':
        return <DeadlineIcon color="warning" />;
      default:
        return null;
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Notifications</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small">
            <InputLabel>Filter</InputLabel>
            <Select
              value={filter}
              label="Filter"
              onChange={(e) => setFilter(e.target.value)}
              sx={{ width: 120 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="unread">Unread</MenuItem>
              <MenuItem value="read">Read</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={handleMarkAllRead}
          >
            Mark All Read
          </Button>
        </Box>
      </Box>

      <Paper>
        <List>
          {filteredNotifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  backgroundColor: notification.read ? 'inherit' : 'action.hover',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.createdAt).toLocaleString()}
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {!notification.read && (
                      <Chip
                        label="New"
                        color="primary"
                        size="small"
                      />
                    )}
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              {index < filteredNotifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {filteredNotifications.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No notifications"
                secondary="You're all caught up!"
              />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default NotificationCenter; 