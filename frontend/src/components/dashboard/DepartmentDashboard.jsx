import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as TaskIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';
import TaskSummaryCard from './TaskSummaryCard';
import TaskCalendar from './TaskCalendar';
import NotificationPanel from './NotificationPanel';
import { useAuth } from '../../contexts/AuthContext';
import { checkPermission } from '../../utils/permissions';
import axios from 'axios';

const DepartmentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    review: 0,
    completed: 0,
    overdue: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const canCreateTasks = checkPermission(user, 'canCreateTasks');
  const canViewAllTasks = checkPermission(user, 'canViewAllTasks');

  useEffect(() => {
    fetchDashboardData();
  }, [user.department]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, tasksResponse] = await Promise.all([
        axios.get(`/api/dashboard/stats/${user.department}`),
        axios.get(`/api/dashboard/recent-tasks/${user.department}`)
      ]);

      setStats(statsResponse.data);
      setRecentTasks(tasksResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentColor = () => {
    switch (user.department) {
      case 'sales':
        return 'primary';
      case 'editorial':
        return 'success';
      case 'design':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" color={getDepartmentColor()}>
          {user.department.charAt(0).toUpperCase() + user.department.slice(1)} Dashboard
        </Typography>
        <Box>
          {canCreateTasks && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/tasks/new')}
              sx={{ mr: 2 }}
            >
              Create Task
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<NotificationIcon />}
            onClick={() => setShowNotifications(true)}
            color={getDepartmentColor()}
          >
            Notifications
          </Button>
        </Box>
      </Box>

      {/* Task Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <TaskSummaryCard
            title="Pending"
            count={stats.pending}
            icon={<TaskIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <TaskSummaryCard
            title="In Progress"
            count={stats.inProgress}
            icon={<TaskIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <TaskSummaryCard
            title="Review"
            count={stats.review}
            icon={<TaskIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <TaskSummaryCard
            title="Completed"
            count={stats.completed}
            icon={<TaskIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <TaskSummaryCard
            title="Overdue"
            count={stats.overdue}
            icon={<TaskIcon />}
            color="error"
            isOverdue={true}
          />
        </Grid>
      </Grid>

      {/* Calendar and Recent Tasks */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Task Calendar
            </Typography>
            <TaskCalendar 
              department={user.department}
              canViewAllTasks={canViewAllTasks}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <RecentActivity tasks={recentTasks} />
          </Paper>
        </Grid>
      </Grid>

      {/* Notifications Panel */}
      <NotificationPanel
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        department={user.department}
      />
    </Box>
  );
};

export default DepartmentDashboard; 