import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Speed as SpeedIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingIcon,
  Assessment as AssessmentIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
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
  Legend
);

const TaskMetrics = ({ taskId, department }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timelineData, setTimelineData] = useState(null);
  const [departmentStats, setDepartmentStats] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, [taskId]);

  const fetchMetrics = async () => {
    try {
      const [metricsResponse, timelineResponse, statsResponse] = await Promise.all([
        axios.get(`/api/tasks/${taskId}/metrics`),
        axios.get(`/api/tasks/${taskId}/timeline-metrics`),
        axios.get(`/api/departments/${department}/stats`)
      ]);

      setMetrics(metricsResponse.data);
      setTimelineData(timelineResponse.data);
      setDepartmentStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
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
      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SpeedIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Completion Rate</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {metrics.completionRate}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={metrics.completionRate} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimeIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Average Time</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {formatDuration(metrics.averageTime)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Per task completion
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Efficiency Score</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {metrics.efficiencyScore}/10
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={metrics.efficiencyScore * 10} 
                color="success"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Revision Rate</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {metrics.revisionRate}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Average revisions per task
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Timeline Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Task Timeline</Typography>
              <Tooltip title="Shows task progress over time">
                <IconButton size="small">
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Line
              data={timelineData}
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
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Department Performance</Typography>
              <Tooltip title="Department efficiency metrics">
                <IconButton size="small">
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Bar
              data={departmentStats}
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

export default TaskMetrics; 