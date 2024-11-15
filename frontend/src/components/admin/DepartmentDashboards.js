import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import SalesDashboard from '../dashboard/SalesDashboard';
import EditorialDashboard from '../dashboard/EditorialDashboard';
import DesignDashboard from '../dashboard/DesignDashboard';

const DepartmentDashboards = () => {
  const [activeDepartment, setActiveDepartment] = useState(0);

  const handleDepartmentChange = (event, newValue) => {
    setActiveDepartment(newValue);
  };

  const DepartmentStats = ({ department }) => (
    <Grid container spacing={3} className="mb-4">
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Active Tasks</Typography>
            <Typography variant="h3">42</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Team Members</Typography>
            <Typography variant="h3">8</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Completion Rate</Typography>
            <Typography variant="h3">87%</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Tabs
        value={activeDepartment}
        onChange={handleDepartmentChange}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Sales" />
        <Tab label="Editorial" />
        <Tab label="Design" />
      </Tabs>

      <Box className="mt-4">
        {activeDepartment === 0 && (
          <>
            <DepartmentStats department="Sales" />
            <SalesDashboard />
          </>
        )}
        {activeDepartment === 1 && (
          <>
            <DepartmentStats department="Editorial" />
            <EditorialDashboard />
          </>
        )}
        {activeDepartment === 2 && (
          <>
            <DepartmentStats department="Design" />
            <DesignDashboard />
          </>
        )}
      </Box>
    </Box>
  );
};

export default DepartmentDashboards; 