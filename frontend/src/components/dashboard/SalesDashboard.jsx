import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Assignment as TaskIcon,
  Business as BrandIcon,
  Book as EditionIcon
} from '@mui/icons-material';
import TaskSummaryCard from './TaskSummaryCard';
import TaskCalendar from './TaskCalendar';
import RecentActivity from './RecentActivity';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SalesDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    brands: 0,
    activeEditions: 0,
    pendingApprovals: 0,
    clientFeedback: 0,
    overdueTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    fetchSalesStats();
    fetchRecentTasks();
  }, []);

  const fetchSalesStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/sales/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching sales stats:', error);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      const response = await axios.get('/api/dashboard/sales/recent-tasks');
      setRecentTasks(response.data);
    } catch (error) {
      console.error('Error fetching recent tasks:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const quickActions = [
    {
      title: 'Create Brand',
      icon: <BrandIcon />,
      action: () => navigate('/brands/new'),
      color: 'primary'
    },
    {
      title: 'New Edition',
      icon: <EditionIcon />,
      action: () => navigate('/editions/new'),
      color: 'secondary'
    },
    {
      title: 'Create Task',
      icon: <TaskIcon />,
      action: () => navigate('/tasks/new'),
      color: 'success'
    },
    {
      title: 'Upload Client Files',
      icon: <UploadIcon />,
      action: () => navigate('/files/upload'),
      color: 'info'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" color="primary">
          Sales Dashboard
        </Typography>
        <Box>
          {quickActions.map((action) => (
            <Tooltip key={action.title} title={action.title}>
              <IconButton
                color={action.color}
                onClick={action.action}
                sx={{ ml: 1 }}
              >
                {action.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <TaskSummaryCard
            title="Active Brands"
            count={stats.brands}
            icon={<BrandIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <TaskSummaryCard
            title="Active Editions"
            count={stats.activeEditions}
            icon={<EditionIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <TaskSummaryCard
            title="Pending Approvals"
            count={stats.pendingApprovals}
            icon={<TaskIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <TaskSummaryCard
            title="Client Feedback"
            count={stats.clientFeedback}
            icon={<TaskIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <TaskSummaryCard
            title="Overdue Tasks"
            count={stats.overdueTasks}
            icon={<TaskIcon />}
            color="error"
            isOverdue={true}
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Calendar View */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Calendar View" />
                <Tab label="Task List" />
                <Tab label="Client Approvals" />
              </Tabs>
            </Box>
            {tabValue === 0 && (
              <TaskCalendar department="sales" />
            )}
            {tabValue === 1 && (
              <TaskList tasks={recentTasks} />
            )}
            {tabValue === 2 && (
              <ClientApprovals />
            )}
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <RecentActivity tasks={recentTasks} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesDashboard; 