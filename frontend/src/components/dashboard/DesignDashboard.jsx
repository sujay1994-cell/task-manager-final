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
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Palette as DesignIcon,
  Image as CoverIcon,
  Upload as UploadIcon,
  Assignment as TaskIcon,
  Warning as OverdueIcon,
  CheckCircle as ApprovedIcon,
  Refresh as RevisionIcon
} from '@mui/icons-material';
import TaskSummaryCard from './TaskSummaryCard';
import TaskCalendar from './TaskCalendar';
import RecentActivity from './RecentActivity';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DesignDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    coverDesigns: 0,
    adDesigns: 0,
    pendingReview: 0,
    approved: 0,
    needsRevision: 0,
    overdue: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [designQueue, setDesignQueue] = useState([]);

  useEffect(() => {
    fetchDesignStats();
    fetchRecentTasks();
    if (user.role.includes('manager')) {
      fetchDesignQueue();
    }
  }, [user.role]);

  const fetchDesignStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/design/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching design stats:', error);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      const response = await axios.get('/api/dashboard/design/recent-tasks');
      setRecentTasks(response.data);
    } catch (error) {
      console.error('Error fetching recent tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDesignQueue = async () => {
    try {
      const response = await axios.get('/api/dashboard/design/queue');
      setDesignQueue(response.data);
    } catch (error) {
      console.error('Error fetching design queue:', error);
    }
  };

  const quickActions = [
    {
      title: 'Upload Design',
      icon: <UploadIcon />,
      action: () => navigate('/designs/upload'),
      color: 'primary'
    },
    {
      title: 'Cover Designs',
      icon: <CoverIcon />,
      action: () => navigate('/designs/covers'),
      color: 'secondary'
    },
    {
      title: 'Ad Designs',
      icon: <DesignIcon />,
      action: () => navigate('/designs/ads'),
      color: 'info'
    }
  ];

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
        <Typography variant="h4" color="secondary.main">
          Design Dashboard
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

      {/* Design Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <TaskSummaryCard
            title="Cover Designs"
            count={stats.coverDesigns}
            icon={<CoverIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TaskSummaryCard
            title="Ad Designs"
            count={stats.adDesigns}
            icon={<DesignIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TaskSummaryCard
            title="Pending Review"
            count={stats.pendingReview}
            icon={<TaskIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TaskSummaryCard
            title="Approved"
            count={stats.approved}
            icon={<ApprovedIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TaskSummaryCard
            title="Needs Revision"
            count={stats.needsRevision}
            icon={<RevisionIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TaskSummaryCard
            title="Overdue"
            count={stats.overdue}
            icon={<OverdueIcon />}
            color="error"
            isOverdue={true}
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Design Tasks and Calendar */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
                <Tab label="Design Queue" />
                <Tab label="Calendar" />
                <Tab label="My Designs" />
              </Tabs>
            </Box>
            {tabValue === 0 && (
              <DesignQueue tasks={designQueue} />
            )}
            {tabValue === 1 && (
              <TaskCalendar department="design" />
            )}
            {tabValue === 2 && (
              <MyDesigns tasks={recentTasks} />
            )}
          </Paper>
        </Grid>

        {/* Recent Activity and Approvals */}
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

export default DesignDashboard; 