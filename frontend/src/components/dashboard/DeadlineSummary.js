import React from 'react';
import {
  Box,
  Button,
  Typography,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Warning as WarningIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const DeadlineSummary = () => {
  const tasks = useSelector(state => state.tasks.items);
  const currentUser = useSelector(state => state.auth.user);
  const isManager = currentUser.role === 'manager' || currentUser.role === 'admin';

  const getOverdueTasks = () => {
    const now = new Date();
    return tasks.filter(task => {
      const isOverdue = new Date(task.deadline) < now;
      const isRelevant = isManager ? 
        task.department === currentUser.department :
        task.assignedTo?._id === currentUser._id;
      return isOverdue && isRelevant && task.status !== 'completed';
    });
  };

  const overdueTasks = getOverdueTasks();
  const overdueCount = overdueTasks.length;

  if (overdueCount === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'error.main',
        color: 'white',
        py: 0.5,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        zIndex: 1200
      }}
    >
      <WarningIcon fontSize="small" />
      <Typography variant="body2">
        {overdueCount} {isManager ? 'team ' : ''}
        {overdueCount === 1 ? 'task is' : 'tasks are'} overdue
      </Typography>
      <Button
        size="small"
        variant="contained"
        color="inherit"
        sx={{ color: 'error.main' }}
      >
        View Tasks
      </Button>
    </Box>
  );
};

export default DeadlineSummary; 