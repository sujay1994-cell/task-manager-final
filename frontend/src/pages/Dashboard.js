import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import TaskCalendar from '../components/calendar/TaskCalendar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    activeTasks: 0,
    pendingReviews: 0,
    completedTasks: 0,
    upcomingDeadlines: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tasksRes, statsRes] = await Promise.all([
          axios.get('/api/tasks/user'),
          axios.get('/api/tasks/stats')
        ]);

        setTasks(tasksRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.name}
        </Typography>
      </Grid>

      {/* Stats Cards */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Active Tasks
          </Typography>
          <Typography component="p" variant="h4">
            {stats.activeTasks}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Pending Reviews
          </Typography>
          <Typography component="p" variant="h4">
            {stats.pendingReviews}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Completed Tasks
          </Typography>
          <Typography component="p" variant="h4">
            {stats.completedTasks}
          </Typography>
        </Paper>
      </Grid>

      {/* Calendar */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 'auto' }}>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Task Calendar
          </Typography>
          <TaskCalendar tasks={tasks} />
        </Paper>
      </Grid>

      {/* Upcoming Deadlines */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Upcoming Deadlines
          </Typography>
          <Grid container spacing={2}>
            {stats.upcomingDeadlines.map((deadline, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle1" color="primary">
                    {deadline.taskName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Due: {new Date(deadline.date).toLocaleDateString()}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard; 