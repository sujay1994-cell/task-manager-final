import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CompleteIcon,
  Warning as PendingIcon,
  Error as RejectedIcon,
  HourglassEmpty as InProgressIcon
} from '@mui/icons-material';

const TaskWorkflowStatus = ({ status, progress }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'COMPLETED':
        return {
          color: 'success',
          icon: <CompleteIcon />,
          label: 'Completed',
          tooltip: 'Task has been completed and approved'
        };
      case 'IN_PROGRESS':
        return {
          color: 'info',
          icon: <InProgressIcon />,
          label: 'In Progress',
          tooltip: 'Task is currently being worked on'
        };
      case 'REVIEW':
        return {
          color: 'warning',
          icon: <PendingIcon />,
          label: 'Under Review',
          tooltip: 'Task is awaiting review'
        };
      case 'CHANGES_REQUESTED':
        return {
          color: 'error',
          icon: <RejectedIcon />,
          label: 'Changes Requested',
          tooltip: 'Changes have been requested'
        };
      default:
        return {
          color: 'default',
          icon: <HourglassEmpty />,
          label: 'Pending',
          tooltip: 'Task is pending'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Tooltip title={statusConfig.tooltip}>
          <Chip
            icon={statusConfig.icon}
            label={statusConfig.label}
            color={statusConfig.color}
            size="small"
          />
        </Tooltip>
        <Typography variant="body2" color="text.secondary">
          {progress}% Complete
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        color={statusConfig.color}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );
};

export default TaskWorkflowStatus; 