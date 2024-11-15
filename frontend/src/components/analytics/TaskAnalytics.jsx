import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingIcon,
  Assessment as AssessmentIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const TaskAnalytics = ({ department }) => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    taskCompletion: [],
    departmentPerformance: [],
    taskDistribution: {},
    timelineData: {}
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, department]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/api/analytics/tasks`, {
        params: {
          department,
          timeRange,
          userId: user.id
        }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRate = () => {
    const { completed, total } = analytics.taskCompletion;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getAverageTime = () => {
    return analytics.taskCompletion.averageTime || 0;
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Task Analytics</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="quarter">Last Quarter</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SpeedIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Completion Rate</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {getCompletionRate()}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Tasks completed on time
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimelineIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Average Time</Typography>
              </Box>
              <Typography variant="h4" color="secondary">
                {getAverageTime()} days
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Per task completion
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Efficiency</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {analytics.efficiency}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Overall efficiency rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Revision Rate</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {analytics.revisionRate}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Tasks requiring revision
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Task Timeline */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Task Timeline</Typography>
              <Tooltip title="Shows task completion trends over time">
                <IconButton size="small">
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Line
              data={analytics.timelineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
              height={300}
            />
          </Paper>
        </Grid>

        {/* Task Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Task Distribution</Typography>
              <Tooltip title="Distribution of tasks by type">
                <IconButton size="small">
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Doughnut
              data={analytics.taskDistribution}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
              height={300}
            />
          </Paper>
        </Grid>

        {/* Department Performance */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Department Performance</Typography>
              <Tooltip title="Performance metrics by department">
                <IconButton size="small">
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Bar
              data={analytics.departmentPerformance}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
              height={300}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskAnalytics; 