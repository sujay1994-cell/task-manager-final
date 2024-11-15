import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const ClientFeedbackModal = ({ open, onClose, task, onSubmit }) => {
  const [feedback, setFeedback] = useState({
    type: 'general',
    content: '',
    priority: 'medium'
  });

  const handleSubmit = () => {
    onSubmit(feedback);
    setFeedback({
      type: 'general',
      content: '',
      priority: 'medium'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Add Client Feedback
        {task && (
          <Typography variant="subtitle2" color="textSecondary">
            Task: {task.name}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Feedback Type</InputLabel>
            <Select
              value={feedback.type}
              onChange={(e) => setFeedback({ ...feedback, type: e.target.value })}
              label="Feedback Type"
            >
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="revision">Revision Request</MenuItem>
              <MenuItem value="approval">Approval</MenuItem>
              <MenuItem value="rejection">Rejection</MenuItem>
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
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Feedback"
            multiline
            rows={4}
            value={feedback.content}
            onChange={(e) => setFeedback({ ...feedback, content: e.target.value })}
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
          disabled={!feedback.content.trim()}
        >
          Submit Feedback
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientFeedbackModal; 