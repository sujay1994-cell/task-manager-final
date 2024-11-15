import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const DepartmentOverview = () => {
  const navigate = useNavigate();

  const departments = [
    {
      name: 'Sales',
      activeUsers: 12,
      activeTasks: 45,
      completionRate: 78,
      pendingApprovals: 5
    },
    {
      name: 'Editorial',
      activeUsers: 15,
      activeTasks: 62,
      completionRate: 65,
      pendingApprovals: 8
    },
    {
      name: 'Design',
      activeUsers: 10,
      activeTasks: 49,
      completionRate: 72,
      pendingApprovals: 10
    }
  ];

  return (
    <Grid container spacing={3}>
      {departments.map((dept) => (
        <Grid item xs={12} key={dept.name}>
          <Card>
            <CardContent>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6">{dept.name} Department</Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/department/${dept.name.toLowerCase()}`)}
                >
                  View Dashboard
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography color="textSecondary">Active Team Members</Typography>
                  <Typography variant="h4">{dept.activeUsers}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography color="textSecondary">Active Tasks</Typography>
                  <Typography variant="h4">{dept.activeTasks}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography color="textSecondary">Completion Rate</Typography>
                  <Box className="flex items-center">
                    <Typography variant="h4" className="mr-2">
                      {dept.completionRate}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={dept.completionRate}
                      className="flex-grow"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography color="textSecondary">Pending Approvals</Typography>
                  <Typography variant="h4">{dept.pendingApprovals}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DepartmentOverview; 