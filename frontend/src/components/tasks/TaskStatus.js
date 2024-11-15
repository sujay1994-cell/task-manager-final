import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { updateTaskStatus } from '../../features/tasks/tasksSlice';

const TaskStatus = ({ task }) => {
  const dispatch = useDispatch();
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const currentUser = useSelector(state => state.auth.user);

  const steps = [
    'Created',
    'Assigned',
    'In Progress',
    'Awaiting Approval',
    'Completed'
  ];

  const getStepIndex = (status) => {
    const statusMap = {
      'created': 0,
      'assigned': 1,
      'in-progress': 2,
      'awaiting-approval': 3,
      'completed': 4,
      'revisions': 2 // Goes back to In Progress
    };
    return statusMap[status] || 0;
  };

  const currentStep = getStepIndex(task.status);

  const getStepIcon = (step) => {
    if (step < currentStep) return <CheckIcon color="success" />;
    if (step === currentStep) {
      if (task.status === 'awaiting-approval') return <WarningIcon color="warning" />;
      if (task.status === 'revisions') return <ErrorIcon color="error" />;
    }
    return null;
  };

  const canUpdateStatus = () => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.department === 'Sales' && task.status === 'awaiting-approval') return true;
    if (currentUser.department === task.department) return true;
    return false;
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      if (newStatus === 'completed' && !feedback.trim()) {
        setError('Please provide feedback before completing the task');
        return;
      }

      await dispatch(updateTaskStatus({
        taskId: task._id,
        status: newStatus,
        feedback
      }));

      setConfirmDialog(false);
      setFeedback('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const getAvailableActions = () => {
    if (!canUpdateStatus()) return [];

    switch (task.status) {
      case 'assigned':
        return [{ label: 'Start Work', status: 'in-progress' }];
      case 'in-progress':
        return [{ label: 'Submit for Approval', status: 'awaiting-approval' }];
      case 'awaiting-approval':
        if (currentUser.department === 'Sales') {
          return [
            { label: 'Approve & Complete', status: 'completed' },
            { label: 'Request Revisions', status: 'revisions' }
          ];
        }
        return [];
      case 'revisions':
        return [{ label: 'Resume Work', status: 'in-progress' }];
      default:
        return [];
    }
  };

  return (
    <Box className="space-y-4">
      <Stepper activeStep={currentStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              StepIconComponent={() => getStepIcon(index)}
              error={task.status === 'revisions' && index === currentStep}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box className="flex justify-between items-center mt-4">
        <Typography variant="subtitle1" color="textSecondary">
          Current Status: 
          <span className="ml-2 font-medium">
            {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
          </span>
        </Typography>

        <Box className="space-x-2">
          {getAvailableActions().map(action => (
            <Button
              key={action.status}
              variant="contained"
              color={action.status === 'completed' ? 'success' : 'primary'}
              onClick={() => {
                if (action.status === 'completed' || action.status === 'revisions') {
                  setConfirmDialog(true);
                } else {
                  handleStatusUpdate(action.status);
                }
              }}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>
          {task.status === 'awaiting-approval' ? 'Complete Task' : 'Request Revisions'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={task.status === 'awaiting-approval' ? 'Approval Comments' : 'Revision Comments'}
            fullWidth
            multiline
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleStatusUpdate(
              task.status === 'awaiting-approval' ? 'completed' : 'revisions'
            )}
            variant="contained"
            color={task.status === 'awaiting-approval' ? 'success' : 'primary'}
          >
            {task.status === 'awaiting-approval' ? 'Complete Task' : 'Request Revisions'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskStatus; 