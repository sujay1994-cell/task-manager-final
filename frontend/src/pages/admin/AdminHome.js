import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BrandIcon,
  Book as EditionIcon,
  Assignment as TaskIcon,
  People as UserIcon,
  ArrowForward as ArrowIcon,
  Timeline as AnalyticsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const AdminHome = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const cards = [
    {
      title: 'Create New Brand',
      description: 'Add a new magazine brand to the system',
      icon: <BrandIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      action: () => navigate('/admin/brands/create'),
      buttonText: 'Create Brand',
    },
    {
      title: 'Manage Editions',
      description: 'View and manage magazine editions',
      icon: <EditionIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.main,
      action: () => navigate('/admin/editions'),
      buttonText: 'View Editions',
    },
    {
      title: 'Task Overview',
      description: 'Monitor all tasks across departments',
      icon: <TaskIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      action: () => navigate('/admin/tasks'),
      buttonText: 'View Tasks',
    },
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: <UserIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.info.main,
      action: () => navigate('/admin/users'),
      buttonText: 'Manage Users',
    },
    {
      title: 'Analytics Dashboard',
      description: 'View detailed performance metrics',
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.warning.main,
      action: () => navigate('/admin/analytics'),
      buttonText: 'View Analytics',
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.error.main,
      action: () => navigate('/admin/settings'),
      buttonText: 'Settings',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                  transition: 'all 0.3s ease',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  backgroundColor: card.color,
                  opacity: 0.1,
                }}
              />
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: card.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="h6" component="h2">
                    {card.title}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={card.action}
                  sx={{
                    backgroundColor: card.color,
                    '&:hover': {
                      backgroundColor: theme.palette.darken(card.color, 0.2),
                    },
                  }}
                >
                  {card.buttonText}
                </Button>
                <IconButton
                  size="small"
                  onClick={card.action}
                  sx={{ color: card.color }}
                >
                  <ArrowIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Stats
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Total Brands</Typography>
                <Typography variant="h3">12</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'secondary.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Active Editions</Typography>
                <Typography variant="h3">24</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Open Tasks</Typography>
                <Typography variant="h3">45</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Active Users</Typography>
                <Typography variant="h3">18</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminHome; 