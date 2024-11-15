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
  Palette as DesignIcon,
  People as PeopleIcon,
  Print as PrintIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import TeamManagement from './TeamManagement';
import DesignTaskManagement from './DesignTaskManagement';
import PrintManagement from './PrintManagement';
import PerformanceMetrics from './PerformanceMetrics';

const DesignManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="p-4">
      <Box className="mb-4">
        <Typography variant="h4" gutterBottom>
          Design Department Dashboard
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
              <Typography variant="h3">88%</Typography>
              <Box className="mt-2">
                <Chip label="10 Active Members" color="primary" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Print Tasks
              </Typography>
              <Typography variant="h3">12</Typography>
              <Box className="mt-2">
                <Chip label="3 Pending Approval" color="warning" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Designs
              </Typography>
              <Typography variant="h3">35</Typography>
              <Box className="mt-2">
                <Chip label="4 Overdue" color="error" size="small" />
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
              <Typography variant="h3">28</Typography>
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
            <Tab icon={<DesignIcon />} label="Design Tasks" />
            <Tab icon={<PrintIcon />} label="Print Management" />
            <Tab icon={<PeopleIcon />} label="Team Management" />
            <Tab icon={<TimelineIcon />} label="Performance" />
          </Tabs>

          <Box className="mt-4">
            {activeTab === 0 && <DesignTaskManagement />}
            {activeTab === 1 && <PrintManagement />}
            {activeTab === 2 && <TeamManagement department="Design" />}
            {activeTab === 3 && <PerformanceMetrics department="Design" />}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DesignManagerDashboard; 