import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const NotificationCenter = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleClearAll = () => {
    // Add your clear all logic here
  };

  const handleDelete = (id) => {
    // Add your delete logic here
  };

  return (
    <div>
      <FormControl fullWidth>
        <InputLabel>Filter</InputLabel>
        <Select value={filter} onChange={handleFilterChange}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="unread">Unread</MenuItem>
          <MenuItem value="read">Read</MenuItem>
        </Select>
      </FormControl>
      
      <Button 
        variant="contained" 
        color="secondary" 
        onClick={handleClearAll}
        style={{ marginTop: '1rem' }}
      >
        Clear All
      </Button>

      <Paper style={{ marginTop: '1rem', maxHeight: 400, overflow: 'auto' }}>
        <List>
          {notifications.map((notification) => (
            <ListItem key={notification.id}>
              <ListItemText
                primary={notification.title}
                secondary={notification.message}
              />
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => handleDelete(notification.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
    </div>
  );
};

export default NotificationCenter; 