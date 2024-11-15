import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Person as AssignIcon,
  Edit as EditIcon,
  Send as SubmitIcon,
  CheckCircle as ApproveIcon,
  Refresh as RevisionIcon,
  Done as CompleteIcon,
  Flag as UrgentIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const TaskTracker = ({ task, onStatusUpdate }) => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const steps = [
    {
      label: 'Created',
      icon: TaskIcon,
      description: 'Task has been created and is ready for assignment',
      color: 'default'
    },
    {
      label: 'Assigned',
      icon: AssignIcon,
      description: 'Task has been assigned to team member',
      color: 'info'
    },
    {
      label: 'In Progress',
      icon: EditIcon,
      description: 'Work is being done on the task',
      color: 'primary'
    },
    {
      label: 'Review',
      icon: SubmitIcon,
      description: 'Task is ready for review',
      color: 'warning'
    },
    {
      label: 'Approved',
      icon: ApproveIcon,
      description: 'Task has been approved',
      color: 'success'
    },
    {
      label: 'Completed',
      icon: CompleteIcon,
      description: 'Task has been completed',
      color: 'success'
    }
  ];

  useEffect(() => {
    setActiveStep(getStepFromStatus(task.status));
  }, [task.status]);

  const getStepFromStatus = (status) => {
    const statusMap = {
      'created': 0,
      'assigned': 1,
      'in_progress': 2,
      'review': 3,
      'approved': 4,
      'completed': 5
    };
    return statusMap[status] || 0;
  };

  const canUpdateStatus = (step) => {
    if (user.role.includes('manager')) return true;
    if (task.assignedTo === user.id) {
      return step === activeStep + 1 && step <= 3;
    }
    return false;
  };

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.put(`/api/tasks/${task._id}/status`, {
        status: newStatus,
        updatedBy: user.id
      });
      onStatusUpdate(response.data);
      setActiveStep(getStepFromStatus(newStatus));
    } catch (error) {
      setError('Error updating task status');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    return (activeStep / (steps.length - 1)) * 100;
  };

  return (
    <Paper sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">Task Progress</Typography>
          {task.priority === 'high' && (
            <Chip
              icon={<UrgentIcon />}
              label="High Priority"
              color="error"
              size="small"
            />
          )}
        </Box>
        <LinearProgress
          variant="determinate"
          value={calculateProgress()}
          sx={{ height: 10, borderRadius: 5 }}
          color={steps[activeStep].color}
        />
      </Box>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              StepIconComponent={() => (
                <Avatar sx={{ 
                  bgcolor: index <= activeStep ? `${step.color}.main` : 'grey.400',
                  width: 24,
                  height: 24
                }}>
                  <step.icon sx={{ fontSize: 16 }} />
                </Avatar>
              )}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {step.label}
                {index === activeStep && task.assignedTo && (
                  <Chip
                    avatar={<Avatar>{task.assignedTo.name[0]}</Avatar>}
                    label={task.assignedTo.name}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </StepLabel>
            <StepContent>
              <Typography color="textSecondary" sx={{ mb: 2 }}>
                {step.description}
              </Typography>
              {canUpdateStatus(index + 1) && index === activeStep + 1 && (
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => handleStatusUpdate(Object.keys(steps)[index])}
                    disabled={loading}
                    size="small"
                    color={step.color}
                  >
                    {`Mark as ${step.label}`}
                  </Button>
                </Box>
              )}
              {index === activeStep && task.status === 'review' && user.role.includes('manager') && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={loading}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    onClick={() => handleStatusUpdate('in_progress')}
                    disabled={loading}
                  >
                    Request Changes
                  </Button>
                </Box>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
};

export default TaskTracker; 