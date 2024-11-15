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
  Edit as EditIcon,
  AssignmentTurnedIn as ApproveIcon,
  Upload as UploadIcon,
  Group as TeamIcon,
  Assignment as TaskIcon,
  Warning as OverdueIcon
} from '@mui/icons-material';
import TaskSummaryCard from './TaskSummaryCard';
import TaskCalendar from './TaskCalendar';
import RecentActivity from './RecentActivity';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditorialDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    assignedTasks: 0,
    inProgress: 0,
    pendingReview: 0,
    completedTasks: 0,
    overdueTasks: 0,
    teamMembers: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [teamWorkload, setTeamWorkload] = useState([]);

  useEffect(() => {
    fetchEditorialStats();
    fetchRecentTasks();
    if (user.role.includes('manager')) {
      fetchTeamWorkload();
    }
  }, [user.role]);

  const fetchEditorialStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/editorial/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching editorial stats:', error);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      const response = await axios.get('/api/dashboard/editorial/recent-tasks');
      setRecentTasks(response.data);
    } catch (error) {
      console.error('Error fetching recent tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamWorkload = async () => {
    try {
      const response = await axios.get('/api/dashboard/editorial/team-workload');
      setTeamWorkload(response.data);
    } catch (error) {
      console.error('Error fetching team workload:', error);
    }
  };

  const quickActions = [
    {
      title: 'Review Tasks',
      icon: <ApproveIcon />,
      action: () => navigate('/tasks/review'),
      color: 'primary',
      managerOnly: true
    },
    {
      title: 'Upload Content',
      icon: <UploadIcon />,
      action: () => navigate('/tasks/upload'),
      color: 'info'
    },
    {
      title: 'Team Overview',
      icon: <TeamIcon />,
      action: () => navigate('/team'),
      color: 'secondary',
      managerOnly: true
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
        <Typography variant="h4" color="success.main">
          Editorial Dashboard
        </Typography>
        <Box>
          {quickActions
            .filter(action => !action.managerOnly || user.role.includes('manager'))
            .map((action) => (
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
        <Grid item xs={12} sm={6} md={user.role.includes('manager') ? 2 : 3}>
          <TaskSummaryCard
            title="Assigned Tasks"
            count={stats.assignedTasks}
            icon={<TaskIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={user.role.includes('manager') ? 2 : 3}>
          <TaskSummaryCard
            title="In Progress"
            count={stats.inProgress}
            icon={<EditIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={user.role.includes('manager') ? 2 : 3}>
          <TaskSummaryCard
            title="Pending Review"
            count={stats.pendingReview}
            icon={<ApproveIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={user.role.includes('manager') ? 2 : 3}>
          <TaskSummaryCard
            title="Completed"
            count={stats.completedTasks}
            icon={<TaskIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={user.role.includes('manager') ? 2 : 3}>
          <TaskSummaryCard
            title="Overdue"
            count={stats.overdueTasks}
            icon={<OverdueIcon />}
            color="error"
            isOverdue={true}
          />
        </Grid>
        {user.role.includes('manager') && (
          <Grid item xs={12} sm={6} md={2}>
            <TaskSummaryCard
              title="Team Members"
              count={stats.teamMembers}
              icon={<TeamIcon />}
              color="secondary"
            />
          </Grid>
        )}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Calendar and Tasks View */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
                <Tab label="Calendar View" />
                <Tab label="My Tasks" />
                {user.role.includes('manager') && <Tab label="Team Overview" />}
              </Tabs>
            </Box>
            {tabValue === 0 && (
              <TaskCalendar department="editorial" />
            )}
            {tabValue === 1 && (
              <TaskList tasks={recentTasks} />
            )}
            {tabValue === 2 && user.role.includes('manager') && (
              <TeamWorkload data={teamWorkload} />
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

export default EditorialDashboard; 