import React, { useState } from 'react';
import Box from '@mui/material/Box';
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
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const NotificationCenter = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(note => note.id !== id));
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <FormControl fullWidth>
        <InputLabel id="filter-label">Filter</InputLabel>
        <Select
          labelId="filter-label"
          value={filter}
          label="Filter"
          onChange={handleFilterChange}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="unread">Unread</MenuItem>
          <MenuItem value="read">Read</MenuItem>
        </Select>
      </FormControl>
      
      <Button 
        variant="contained" 
        color="secondary" 
        onClick={handleClearAll}
        sx={{ mt: 2 }}
      >
        Clear All
      </Button>

      <Paper sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
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
    </Box>
  );
};

export default NotificationCenter; 