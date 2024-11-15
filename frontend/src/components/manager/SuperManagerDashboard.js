import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  Business as BrandIcon
} from '@mui/icons-material';
import DepartmentOverview from './DepartmentOverview';
import TaskOverview from './TaskOverview';
import BrandOverview from './BrandOverview';

const SuperManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="p-4">
      <Box className="mb-4">
        <Typography variant="h4" gutterBottom>
          Super Manager Dashboard
        </Typography>
        <Typography color="textSecondary">
          Overview of all departments and tasks
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} className="mb-4">
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Tasks
              </Typography>
              <Box className="flex justify-between items-center">
                <Typography variant="h3">156</Typography>
                <Box>
                  <Chip label="Sales: 45" color="primary" size="small" className="mb-1" />
                  <Chip label="Editorial: 62" color="secondary" size="small" className="mb-1" />
                  <Chip label="Design: 49" color="default" size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Approvals
              </Typography>
              <Typography variant="h3">23</Typography>
              <Box className="mt-2">
                <Chip label="High Priority: 8" color="error" size="small" className="mr-1" />
                <Chip label="Medium: 15" color="warning" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Editions
              </Typography>
              <Typography variant="h3">12</Typography>
              <Box className="mt-2">
                <Typography variant="caption" color="textSecondary">
                  Across 5 brands
                </Typography>
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
            <Tab icon={<DashboardIcon />} label="Department Overview" />
            <Tab icon={<TaskIcon />} label="Task Management" />
            <Tab icon={<BrandIcon />} label="Brand Overview" />
          </Tabs>

          <Box className="mt-4">
            {activeTab === 0 && <DepartmentOverview />}
            {activeTab === 1 && <TaskOverview />}
            {activeTab === 2 && <BrandOverview />}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SuperManagerDashboard; 