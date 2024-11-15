import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  useTheme
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Assignment as TaskIcon,
  People as TeamIcon,
  Timeline as AnalyticsIcon,
  Notifications as NotificationIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  ShoppingCart as SalesIcon
} from '@mui/icons-material';
import Calendar from '../calendar/Calendar';
import NotificationCenter from '../notifications/NotificationCenter';

const HomePage = () => {
  const theme = useTheme();
  const user = JSON.parse(localStorage.getItem('user'));

  const quickActions = [
    { icon: <TaskIcon />, label: 'New Task', color: theme.palette.primary.main, path: '/tasks/new' },
    { icon: <CalendarIcon />, label: 'Calendar', color: theme.palette.secondary.main, path: '/calendar' },
    { icon: <TeamIcon />, label: 'Team', color: theme.palette.success.main, path: '/team' },
    { icon: <NotificationIcon />, label: 'Notifications', color: theme.palette.warning.main, path: '/notifications' }
  ];

  const departmentActions = {
    Sales: [
      { icon: <SalesIcon />, label: 'Client Tasks', path: '/sales/tasks' },
      { icon: <EditIcon />, label: 'Create Task', path: '/sales/new-task' }
    ],
    Editorial: [
      { icon: <EditIcon />, label: 'Editorial Tasks', path: '/editorial/tasks' },
      { icon: <TaskIcon />, label: 'Review Queue', path: '/editorial/review' }
    ],
    Design: [
      { icon: <PrintIcon />, label: 'Design Tasks', path: '/design/tasks' },
      { icon: <TaskIcon />, label: 'Proofing', path: '/design/proofing' }
    ]
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, backgroundColor: theme.palette.primary.main, color: 'white' }}>
            <Typography variant="h4">Welcome back, {user?.name}</Typography>
            <Typography variant="subtitle1">Here's your workspace overview</Typography>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Quick Actions</Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Card sx={{ 
                  bgcolor: action.color,
                  color: 'white',
                  transition: '0.3s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <IconButton color="inherit">
                      {action.icon}
                    </IconButton>
                    <Typography>{action.label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Calendar and Notifications */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>Calendar</Typography>
            <Calendar />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '400px', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>Recent Notifications</Typography>
            <NotificationCenter compact />
          </Paper>
        </Grid>

        {/* Department-Specific Actions */}
        {user?.department && departmentActions[user.department] && (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>{user.department} Actions</Typography>
            <Grid container spacing={2}>
              {departmentActions[user.department].map((action, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Button
                    variant="contained"
                    startIcon={action.icon}
                    fullWidth
                    sx={{ p: 2, height: '100%' }}
                  >
                    {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default HomePage; 