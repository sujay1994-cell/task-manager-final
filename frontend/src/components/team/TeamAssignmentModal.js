import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

const TeamAssignmentModal = ({ open, onClose, onSubmit, task }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    // Fetch team members from API
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch('/api/users?department=Editorial');
        const data = await response.json();
        setTeamMembers(data);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    if (open) {
      fetchTeamMembers();
    }
  }, [open]);

  const handleToggleMember = (memberId) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleSubmit = () => {
    onSubmit(selectedMembers);
    setSelectedMembers([]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Assign Team Members
        {task && (
          <Typography variant="subtitle2" color="textSecondary">
            Task: {task.name}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <List>
            {teamMembers.map((member) => (
              <React.Fragment key={member._id}>
                <ListItem
                  button
                  onClick={() => handleToggleMember(member._id)}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={selectedMembers.includes(member._id)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={member.name}
                    secondary={member.role}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={selectedMembers.length === 0}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamAssignmentModal; 