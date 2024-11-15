import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  People as TeamIcon,
  Book as EditionIcon,
  Business as BrandIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Box sx={{ width: 240 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" noWrap component="div">
          {user?.name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {user?.role}
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem button onClick={() => navigate('/')}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button onClick={() => navigate('/tasks')}>
          <ListItemIcon>
            <TaskIcon />
          </ListItemIcon>
          <ListItemText primary="Tasks" />
        </ListItem>
        <ListItem button onClick={() => navigate('/editions')}>
          <ListItemIcon>
            <EditionIcon />
          </ListItemIcon>
          <ListItemText primary="Editions" />
        </ListItem>
        <ListItem button onClick={() => navigate('/brands')}>
          <ListItemIcon>
            <BrandIcon />
          </ListItemIcon>
          <ListItemText primary="Brands" />
        </ListItem>
        <ListItem button onClick={() => navigate('/team')}>
          <ListItemIcon>
            <TeamIcon />
          </ListItemIcon>
          <ListItemText primary="Team" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button onClick={() => navigate('/settings')}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar; 