import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon
} from '@mui/icons-material';
import UserManagement from './UserManagement';
import BrandManagement from './BrandManagement';
import DepartmentDashboards from './DepartmentDashboards';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="p-4">
      <Box className="mb-4 flex justify-between items-center">
        <Typography variant="h4">Super Admin Dashboard</Typography>
        <Box className="space-x-2">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            color="primary"
          >
            Add User
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            color="secondary"
          >
            Add Brand
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} className="mb-4">
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h3">24</Typography>
              <Typography variant="body2" color="textSecondary">
                Across all departments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Brands
              </Typography>
              <Typography variant="h3">8</Typography>
              <Typography variant="body2" color="textSecondary">
                With ongoing editions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Tasks
              </Typography>
              <Typography variant="h3">156</Typography>
              <Typography variant="body2" color="textSecondary">
                Across all departments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab icon={<PeopleIcon />} label="User Management" />
            <Tab icon={<BusinessIcon />} label="Brand Management" />
            <Tab icon={<DashboardIcon />} label="Department Dashboards" />
          </Tabs>

          <Box className="mt-4">
            {activeTab === 0 && <UserManagement />}
            {activeTab === 1 && <BrandManagement />}
            {activeTab === 2 && <DepartmentDashboards />}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SuperAdminDashboard; 