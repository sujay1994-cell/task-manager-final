import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Chip,
  Button
} from '@mui/material';
import {
  Assignment as TaskIcon,
  People as PeopleIcon,
  RateReview as ReviewIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import TeamManagement from './TeamManagement';
import EditorialTaskManagement from './EditorialTaskManagement';
import ContentReview from './ContentReview';
import PerformanceMetrics from './PerformanceMetrics';

const EditorialManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="p-4">
      <Box className="mb-4">
        <Typography variant="h4" gutterBottom>
          Editorial Department Dashboard
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} className="mb-4">
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Team Performance
              </Typography>
              <Typography variant="h3">92%</Typography>
              <Box className="mt-2">
                <Chip label="8 Active Members" color="primary" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Reviews
              </Typography>
              <Typography variant="h3">15</Typography>
              <Box className="mt-2">
                <Chip label="5 High Priority" color="error" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Tasks
              </Typography>
              <Typography variant="h3">28</Typography>
              <Box className="mt-2">
                <Chip label="3 Overdue" color="warning" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Completed This Week
              </Typography>
              <Typography variant="h3">34</Typography>
              <Box className="mt-2">
                <Chip label="On Track" color="success" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab icon={<TaskIcon />} label="Task Management" />
            <Tab icon={<ReviewIcon />} label="Content Review" />
            <Tab icon={<PeopleIcon />} label="Team Management" />
            <Tab icon={<TimelineIcon />} label="Performance" />
          </Tabs>

          <Box className="mt-4">
            {activeTab === 0 && <EditorialTaskManagement />}
            {activeTab === 1 && <ContentReview />}
            {activeTab === 2 && <TeamManagement department="Editorial" />}
            {activeTab === 3 && <PerformanceMetrics department="Editorial" />}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditorialManagerDashboard; 