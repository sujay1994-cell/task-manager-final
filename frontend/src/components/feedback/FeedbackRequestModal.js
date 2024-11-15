import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material';

const FeedbackRequestModal = ({ open, onClose, onSubmit, task }) => {
  const [feedback, setFeedback] = useState({
    department: '',
    type: 'review',
    message: '',
    priority: 'normal'
  });

  const handleSubmit = () => {
    onSubmit(feedback);
    setFeedback({
      department: '',
      type: 'review',
      message: '',
      priority: 'normal'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Request Feedback
        {task && (
          <Typography variant="subtitle2" color="textSecondary">
            Task: {task.name}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Department</InputLabel>
            <Select
              value={feedback.department}
              onChange={(e) => setFeedback({ ...feedback, department: e.target.value })}
              label="Department"
            >
              <MenuItem value="Sales">Sales</MenuItem>
              <MenuItem value="Design">Design</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={feedback.type}
              onChange={(e) => setFeedback({ ...feedback, type: e.target.value })}
              label="Type"
            >
              <MenuItem value="review">Review Request</MenuItem>
              <MenuItem value="changes">Change Request</MenuItem>
              <MenuItem value="approval">Approval Request</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={feedback.priority}
              onChange={(e) => setFeedback({ ...feedback, priority: e.target.value })}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Message"
            multiline
            rows={4}
            value={feedback.message}
            onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
            fullWidth
            required
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!feedback.department || !feedback.message}
        >
          Send Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackRequestModal; 