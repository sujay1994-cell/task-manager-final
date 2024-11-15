import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip
} from '@mui/material';

const TaskDetailsDialog = ({ open, onClose, event }) => {
  if (!event) return null;

  const task = {
    title: event.title,
    department: event.extendedProps.department,
    status: event.extendedProps.status,
    deadline: event.start,
    assignedTo: event.extendedProps.assignedTo
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'in_review': return 'info';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{task.title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Department
          </Typography>
          <Typography variant="body1">
            {task.department}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Status
          </Typography>
          <Chip
            label={task.status}
            color={getStatusColor(task.status)}
            size="small"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Deadline
          </Typography>
          <Typography variant="body1">
            {task.deadline.toLocaleDateString()}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Assigned To
          </Typography>
          <Typography variant="body1">
            {task.assignedTo || 'Unassigned'}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" color="primary">
          View Task Details
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailsDialog; 