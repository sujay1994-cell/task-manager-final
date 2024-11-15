import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Send as SubmitIcon,
  Check as ApproveIcon,
  Edit as ReviseIcon,
  Done as CompleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const TaskWorkflowActions = ({ task, onActionSubmit }) => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selectedAction, setSelectedAction] = useState(null);
  const { user } = useAuth();

  const handleActionClick = (action) => {
    if (action === 'request_changes') {
      setSelectedAction(action);
      setFeedbackOpen(true);
    } else {
      handleSubmitAction(action);
    }
  };

  const handleSubmitAction = (action, feedbackText = '') => {
    onActionSubmit(action, feedbackText);
    setFeedbackOpen(false);
    setFeedback('');
  };

  const getAvailableActions = () => {
    if (!task || !user) return [];

    const actions = [];

    switch (task.status) {
      case 'ASSIGNED':
        if (task.assignedTo === user.id) {
          actions.push({
            icon: <StartIcon />,
            name: 'start',
            tooltip: 'Start Task',
            color: 'primary'
          });
        }
        break;

      case 'IN_PROGRESS':
        if (task.assignedTo === user.id) {
          actions.push({
            icon: <SubmitIcon />,
            name: 'submit',
            tooltip: 'Submit for Review',
            color: 'info'
          });
        }
        break;

      case 'REVIEW':
        if (user.role === 'manager' || user.role === 'admin') {
          actions.push(
            {
              icon: <ApproveIcon />,
              name: 'approve',
              tooltip: 'Approve Task',
              color: 'success'
            },
            {
              icon: <ReviseIcon />,
              name: 'request_changes',
              tooltip: 'Request Changes',
              color: 'warning'
            }
          );
        }
        break;

      case 'APPROVED':
        if (task.assignedTo === user.id) {
          actions.push({
            icon: <CompleteIcon />,
            name: 'complete',
            tooltip: 'Mark as Complete',
            color: 'success'
          });
        }
        break;
    }

    return actions;
  };

  const actions = getAvailableActions();

  return (
    <>
      <Box sx={{ position: 'relative', mt: 2 }}>
        {actions.length > 0 && (
          <SpeedDial
            ariaLabel="Task Actions"
            sx={{ position: 'absolute', bottom: 16, right: 16 }}
            icon={<SpeedDialIcon />}
          >
            {actions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.tooltip}
                onClick={() => handleActionClick(action.name)}
                FabProps={{
                  sx: { bgcolor: `${action.color}.main`, '&:hover': { bgcolor: `${action.color}.dark` } }
                }}
              />
            ))}
          </SpeedDial>
        )}
      </Box>

      <Dialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)}>
        <DialogTitle>Provide Feedback</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Feedback"
            fullWidth
            multiline
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleSubmitAction(selectedAction, feedback)}
            variant="contained"
            color="primary"
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskWorkflowActions; 