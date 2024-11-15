import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Badge,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Notifications as NotificationIcon,
  CalendarToday as CalendarIcon,
  Assignment as TaskIcon,
  Book as BrandIcon,
  LibraryBooks as EditionIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TaskCalendar from './TaskCalendar';
import NotificationPopup from '../notifications/NotificationPopup';
import socket from '../../utils/socket';

const ModernDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    // Connect to socket for real-time updates
    socket.connect();
    socket.emit('joinRoom', user.department);

    // Listen for notifications
    socket.on('newNotification', handleNewNotification);
    socket.on('taskUpdate', handleTaskUpdate);

    return () => {
      socket.off('newNotification');
      socket.off('taskUpdate');
      socket.disconnect();
    };
  }, []);

  const quickActions = [
    {
      title: 'Create Brand',
      icon: <BrandIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      action: () => navigate('/brands/new'),
      permission: 'canManageBrands'
    },
    {
      title: 'Create Edition',
      icon: <EditionIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.main,
      action: () => navigate('/editions/new'),
      permission: 'canManageEditions'
    },
    {
      title: 'Create Task',
      icon: <TaskIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      action: () => navigate('/tasks/new'),
      permission: 'canCreateTasks'
    }
  ];

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const handleTaskUpdate = (update) => {
    // Handle real-time task updates
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Quick Action Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  cursor: 'pointer'
                },
                borderLeft: `4px solid ${action.color}`
              }}
              onClick={action.action}
            >
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                p: 4
              }}>
                <Box sx={{ 
                  color: action.color,
                  mb: 2
                }}>
                  {action.icon}
                </Box>
                <Typography variant="h6" align="center">
                  {action.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Task Summary and Calendar */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6">
                  {showCalendar ? 'Calendar View' : 'Recent Tasks'}
                </Typography>
                <IconButton onClick={() => setShowCalendar(!showCalendar)}>
                  {showCalendar ? <TaskIcon /> : <CalendarIcon />}
                </IconButton>
              </Box>
              {showCalendar ? (
                <TaskCalendar />
              ) : (
                <TaskList />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications and Activity */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6">
                  Recent Activity
                </Typography>
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationIcon />
                </Badge>
              </Box>
              <ActivityFeed notifications={notifications} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notification Popup */}
      <NotificationPopup />
    </Box>
  );
};

// Helper component for task list
const TaskList = () => {
  // Implement task list component
  return null;
};

// Helper component for activity feed
const ActivityFeed = ({ notifications }) => {
  // Implement activity feed component
  return null;
};

export default ModernDashboard; 