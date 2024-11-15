import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  Paper,
  Alert,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Edit as EditIcon,
  Send as SubmitIcon,
  CheckCircle as ApproveIcon,
  Refresh as RevisionIcon,
  Done as CompleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const workflowSteps = [
  {
    label: 'Created',
    icon: TaskIcon,
    description: 'Task has been created and is ready for assignment'
  },
  {
    label: 'In Progress',
    icon: EditIcon,
    description: 'Task is being worked on'
  },
  {
    label: 'Review',
    icon: SubmitIcon,
    description: 'Task is ready for review'
  },
  {
    label: 'Approved',
    icon: ApproveIcon,
    description: 'Task has been approved'
  },
  {
    label: 'Completed',
    icon: CompleteIcon,
    description: 'Task has been completed'
  }
];

const TaskWorkflow = ({ taskId }) => {
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}`);
      setTask(response.data);
      setActiveStep(getStepFromStatus(response.data.status));
    } catch (error) {
      setError('Error fetching task details');
    } finally {
      setLoading(false);
    }
  };

  const getStepFromStatus = (status) => {
    switch (status) {
      case 'created': return 0;
      case 'in_progress': return 1;
      case 'review': return 2;
      case 'approved': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  };

  const handleWorkflowAction = async (action) => {
    try {
      const payload = {
        action,
        feedback: feedback.trim(),
        userId: user.id
      };

      const response = await axios.post(`/api/tasks/${taskId}/workflow`, payload);
      setTask(response.data);
      setActiveStep(getStepFromStatus(response.data.status));
      setFeedback('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating task status');
    }
  };

  const canPerformAction = (action) => {
    if (!task || !user) return false;

    switch (action) {
      case 'start':
        return task.assignedTo === user.id && task.status === 'created';
      case 'submit':
        return task.assignedTo === user.id && task.status === 'in_progress';
      case 'approve':
        return user.role.includes('manager') && task.status === 'review';
      case 'revise':
        return user.role.includes('manager') && task.status === 'review';
      case 'complete':
        return task.assignedTo === user.id && task.status === 'approved';
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={activeStep} orientation="vertical">
        {workflowSteps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              StepIconComponent={step.icon}
              optional={
                index === activeStep ? (
                  <Typography variant="caption" color="error">
                    {task?.deadline && `Deadline: ${new Date(task.deadline).toLocaleDateString()}`}
                  </Typography>
                ) : null
              }
            >
              {step.label}
            </StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                <Typography>{step.description}</Typography>
                {task?.workflow?.[index]?.feedback && (
                  <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.100' }}>
                    <Typography variant="body2" color="text.secondary">
                      Feedback: {task.workflow[index].feedback}
                    </Typography>
                  </Paper>
                )}
              </Box>
              <Box sx={{ mb: 2 }}>
                {index === activeStep && (
                  <>
                    {(canPerformAction('revise') || canPerformAction('submit')) && (
                      <TextField
                        fullWidth
                        label="Feedback/Comments"
                        multiline
                        rows={3}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                    )}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {canPerformAction('start') && (
                        <Button
                          variant="contained"
                          onClick={() => handleWorkflowAction('start')}
                        >
                          Start Task
                        </Button>
                      )}
                      {canPerformAction('submit') && (
                        <Button
                          variant="contained"
                          onClick={() => handleWorkflowAction('submit')}
                        >
                          Submit for Review
                        </Button>
                      )}
                      {canPerformAction('approve') && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => handleWorkflowAction('approve')}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="warning"
                            onClick={() => handleWorkflowAction('revise')}
                          >
                            Request Changes
                          </Button>
                        </>
                      )}
                      {canPerformAction('complete') && (
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => handleWorkflowAction('complete')}
                        >
                          Complete Task
                        </Button>
                      )}
                    </Box>
                  </>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default TaskWorkflow; 