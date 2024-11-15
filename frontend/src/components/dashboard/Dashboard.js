import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  IconButton,
  Drawer,
  AppBar,
  Toolbar,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  People as TeamIcon,
  Book as EditionIcon,
  Business as BrandIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const Dashboard = () => {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const toggleDrawer = () => {
    setOpen(!open);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/dashboard/all', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setDashboardData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 3 }}>
      <Typography color="error">Error: {error}</Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="absolute">
        <Toolbar sx={{ pr: '24px' }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{ marginRight: '36px' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            Magazine Task Manager
          </Typography>
          <IconButton color="inherit">
            <NotificationIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <Sidebar />
      </Drawer>

      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          pt: 8
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            {/* Overview Cards */}
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  Total Brands
                </Typography>
                <Typography variant="h4">
                  {dashboardData.overview.totalBrands}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  Total Editions
                </Typography>
                <Typography variant="h4">
                  {dashboardData.overview.totalEditions}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  Active Tasks
                </Typography>
                <Typography variant="h4">
                  {dashboardData.overview.totalTasks}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  Team Members
                </Typography>
                <Typography variant="h4">
                  {dashboardData.overview.totalUsers}
                </Typography>
              </Paper>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <List>
                  {dashboardData.recentActivity.map((task) => (
                    <ListItem key={task._id} divider>
                      <ListItemText
                        primary={task.name}
                        secondary={`Assigned to: ${task.assignedTo?.name || 'Unassigned'}`}
                      />
                      <Chip
                        label={task.status}
                        color={
                          task.status === 'completed' ? 'success' :
                          task.status === 'in_progress' ? 'primary' :
                          task.status === 'in_review' ? 'warning' : 'default'
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Department Stats */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sales Department
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Total Clients"
                        secondary={dashboardData.departments.sales.totalClients}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Active Editions"
                        secondary={dashboardData.departments.sales.activeEditions}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Pending Tasks"
                        secondary={dashboardData.departments.sales.pendingTasks}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Editorial Department
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Total Articles"
                        secondary={dashboardData.departments.editorial.totalArticles}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="In Progress"
                        secondary={dashboardData.departments.editorial.inProgress}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Completed"
                        secondary={dashboardData.departments.editorial.completed}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Design Department
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Total Designs"
                        secondary={dashboardData.departments.design.totalDesigns}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="In Review"
                        secondary={dashboardData.departments.design.inReview}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Approved"
                        secondary={dashboardData.departments.design.approved}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;