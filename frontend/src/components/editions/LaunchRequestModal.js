import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  CircularProgress
} from '@mui/material';
import {
  CalendarMonth,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { requestLaunch } from '../../features/editions/editionsSlice';

const LaunchRequestModal = ({ open, onClose, edition }) => {
  const dispatch = useDispatch();
  const [launchDate, setLaunchDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const tasks = useSelector(state => 
    state.tasks.items.filter(task => task.edition === edition?._id)
  );

  const incompleteTasks = tasks.filter(task => task.status !== 'completed');
  const allTasksCompleted = incompleteTasks.length === 0;

  const handleSubmit = async () => {
    if (!launchDate) {
      setError('Please select a launch date');
      return;
    }

    if (!allTasksCompleted) {
      setError('All tasks must be completed before requesting launch');
      return;
    }

    setLoading(true);
    try {
      await dispatch(requestLaunch({
        editionId: edition._id,
        launchDate,
        tasks: tasks.map(task => task._id)
      }));
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1); // Minimum date is tomorrow

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Request Magazine Launch
      </DialogTitle>
      <DialogContent>
        <Box className="space-y-4">
          <Typography variant="subtitle1" gutterBottom>
            Edition: {edition?.name}
          </Typography>

          {/* Task Status Summary */}
          <Box className="bg-gray-50 p-4 rounded">
            <Typography variant="subtitle2" gutterBottom>
              Task Status
            </Typography>
            {allTasksCompleted ? (
              <Alert icon={<CheckIcon />} severity="success">
                All tasks are completed
              </Alert>
            ) : (
              <Alert severity="warning" icon={<WarningIcon />}>
                {incompleteTasks.length} tasks still incomplete
              </Alert>
            )}

            {!allTasksCompleted && (
              <List dense>
                {incompleteTasks.map(task => (
                  <ListItem key={task._id}>
                    <ListItemIcon>
                      <Checkbox checked={false} disabled />
                    </ListItemIcon>
                    <ListItemText
                      primary={task.name}
                      secondary={`Status: ${task.status} | Department: ${task.department}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* Launch Date Selection */}
          <Box>
            <TextField
              fullWidth
              required
              type="datetime-local"
              label="Launch Date & Time"
              value={launchDate}
              onChange={(e) => setLaunchDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: minDate.toISOString().slice(0, 16)
              }}
            />
            <Typography variant="caption" color="textSecondary" className="mt-1">
              Please select a date and time for the magazine launch
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !allTasksCompleted || !launchDate}
          startIcon={loading ? <CircularProgress size={20} /> : <CalendarMonth />}
        >
          Request Launch
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LaunchRequestModal; 