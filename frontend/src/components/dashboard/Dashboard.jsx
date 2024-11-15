import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Warning as OverdueIcon,
  CheckCircle as CompletedIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import TaskCalendar from './TaskCalendar';
import TaskSummaryCard from './TaskSummaryCard';
import NotificationPanel from './NotificationPanel';
import axios from 'axios';
import { checkPermission } from '../../utils/permissions';

const Dashboard = () => {
  const { user } = useAuth();
  const canViewAllTasks = checkPermission(user, 'canViewAllTasks');
  const canManageBrands = checkPermission(user, 'canManageBrands');
  const [taskStats, setTaskStats] = useState({
    inProgress: 0,
    pendingApproval: 0,
    overdue: 0,
    completed: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchTaskStats();
    fetchNotifications();
  }, [user]);

  const fetchTaskStats = async () => {
    try {
      const url = canViewAllTasks 
        ? `/api/tasks/stats?department=${user.department}`
        : `/api/tasks/stats?assignedTo=${user.id}`;
      
      const response = await axios.get(url);
      setTaskStats(response.data);
    } catch (error) {
      console.error('Error fetching task stats:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const getDepartmentColor = (department) => {
    switch (department) {
      case 'sales':
        return 'primary';
      case 'editorial':
        return 'success';
      case 'design':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" color={getDepartmentColor(user.department)}>
          {user.department.charAt(0).toUpperCase() + user.department.slice(1)} Dashboard
        </Typography>
        <Tooltip title="Notifications">
          <IconButton onClick={() => setShowNotifications(true)}>
            <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
              <NotificationIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Task Statistics Cards */}
        <Grid item xs={12} md={3}>
          <TaskSummaryCard
            title="In Progress"
            count={taskStats.inProgress}
            icon={<TaskIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TaskSummaryCard
            title="Pending Approval"
            count={taskStats.pendingApproval}
            icon={<TaskIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TaskSummaryCard
            title="Overdue"
            count={taskStats.overdue}
            icon={<OverdueIcon />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TaskSummaryCard
            title="Completed"
            count={taskStats.completed}
            icon={<CompletedIcon />}
            color="success"
          />
        </Grid>

        {/* Calendar View */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Task Calendar
            </Typography>
            <TaskCalendar department={user.department} />
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {/* Add recent activity component */}
          </Paper>
        </Grid>
      </Grid>

      <NotificationPanel
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onNotificationRead={fetchNotifications}
      />
    </Box>
  );
};

export default Dashboard; 