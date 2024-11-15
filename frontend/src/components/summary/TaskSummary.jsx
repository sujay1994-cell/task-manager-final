import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Divider,
  Button
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Warning as UrgentIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  TrendingUp as TrendingIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TaskSummary = ({ brand, edition }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    urgent: [],
    pending: [],
    completed: [],
    recent: []
  });
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingApprovals: 0,
    overdueCount: 0
  });

  useEffect(() => {
    fetchSummary();
  }, [brand, edition]);

  const fetchSummary = async () => {
    try {
      const [summaryResponse, statsResponse] = await Promise.all([
        axios.get('/api/tasks/summary', {
          params: {
            brand,
            edition,
            department: user.department
          }
        }),
        axios.get('/api/tasks/stats', {
          params: {
            brand,
            edition,
            department: user.department
          }
        })
      ]);

      setSummary(summaryResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching task summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'review': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
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
    <Box>
      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Total Tasks</Typography>
                <TaskIcon color="primary" />
              </Box>
              <Typography variant="h3" color="primary">
                {stats.totalTasks}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {stats.completedTasks} completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Pending Approvals</Typography>
                <PendingIcon color="warning" />
              </Box>
              <Typography variant="h3" color="warning.main">
                {stats.pendingApprovals}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Awaiting review
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Overdue</Typography>
                <UrgentIcon color="error" />
              </Box>
              <Typography variant="h3" color="error">
                {stats.overdueCount}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Need immediate attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Completion Rate</Typography>
                <TrendingIcon color="success" />
              </Box>
              <Typography variant="h3" color="success.main">
                {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Overall progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Urgent Tasks */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Urgent Tasks
            <Chip
              label={summary.urgent.length}
              color="error"
              size="small"
              sx={{ ml: 1 }}
            />
          </Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchSummary} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        {summary.urgent.map((task) => (
          <Box
            key={task._id}
            sx={{
              p: 2,
              mb: 1,
              border: 1,
              borderColor: 'error.light',
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' }
            }}
            onClick={() => navigate(`/tasks/${task._id}`)}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1">{task.title}</Typography>
              <Chip
                label={`Due: ${new Date(task.deadline).toLocaleDateString()}`}
                color="error"
                size="small"
              />
            </Box>
            <Typography variant="body2" color="textSecondary">
              {task.brand.name} {'>'} {task.edition.name}
            </Typography>
          </Box>
        ))}
      </Paper>

      {/* Recent Activity */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        {summary.recent.map((task) => (
          <Box key={task._id} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1">{task.title}</Typography>
              <Chip
                label={task.status}
                color={getStatusColor(task.status)}
                size="small"
              />
            </Box>
            <Typography variant="body2" color="textSecondary">
              Last updated: {new Date(task.updatedAt).toLocaleString()}
            </Typography>
            <Divider sx={{ my: 1 }} />
          </Box>
        ))}
        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate('/tasks')}
        >
          View All Tasks
        </Button>
      </Paper>
    </Box>
  );
};

export default TaskSummary; 