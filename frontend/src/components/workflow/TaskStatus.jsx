import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  Tooltip
} from '@mui/material';
import {
  Flag as PriorityIcon,
  AccessTime as TimeIcon,
  CheckCircle as CompletedIcon,
  Warning as OverdueIcon,
  Refresh as ReopenIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const TaskStatus = ({ task, onStatusUpdate }) => {
  const { user } = useAuth();
  const [reopenDialog, setReopenDialog] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    calculateProgress();
  }, [task]);

  const calculateProgress = () => {
    const statusWeights = {
      'created': 0,
      'in_progress': 25,
      'review': 50,
      'approved': 75,
      'completed': 100
    };
    setProgress(statusWeights[task.status] || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'review':
        return 'warning';
      case 'approved':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleReopen = async () => {
    try {
      const response = await axios.post(`/api/tasks/${task._id}/reopen`, {
        reason: reopenReason,
        reopenedBy: user.id
      });
      onStatusUpdate(response.data);
      setReopenDialog(false);
      setReopenReason('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error reopening task');
    }
  };

  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed';
  const canReopen = user.role.includes('manager') && task.status === 'completed';

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Task Status</Typography>
              <Box>
                {canReopen && (
                  <Tooltip title="Reopen Task">
                    <IconButton 
                      color="warning"
                      onClick={() => setReopenDialog(true)}
                    >
                      <ReopenIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="View History">
                  <IconButton>
                    <HistoryIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress}
                color={isOverdue ? 'error' : getStatusColor(task.status)}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip
                icon={task.status === 'completed' ? <CompletedIcon /> : <TimeIcon />}
                label={task.status.replace('_', ' ').toUpperCase()}
                color={getStatusColor(task.status)}
              />
              {isOverdue && (
                <Chip
                  icon={<OverdueIcon />}
                  label="OVERDUE"
                  color="error"
                />
              )}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Created
            </Typography>
            <Typography>
              {new Date(task.createdAt).toLocaleDateString()}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Deadline
            </Typography>
            <Typography color={isOverdue ? 'error' : 'inherit'}>
              {new Date(task.deadline).toLocaleDateString()}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip
                icon={<PriorityIcon />}
                label={task.priority.toUpperCase()}
                color={task.priority === 'high' ? 'error' : 'default'}
                size="small"
                variant="outlined"
              />
              {task.completedAt && (
                <Chip
                  icon={<CompletedIcon />}
                  label={`Completed: ${new Date(task.completedAt).toLocaleDateString()}`}
                  color="success"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Dialog
        open={reopenDialog}
        onClose={() => setReopenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reopen Task</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for Reopening"
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReopenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleReopen}
            disabled={!reopenReason.trim()}
          >
            Reopen Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskStatus; 