import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Flag as PriorityIcon
} from '@mui/icons-material';

const TaskCard = ({ task }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getDaysRemaining = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <Card sx={{ 
      position: 'relative',
      '&:hover': {
        boxShadow: 6,
        transform: 'translateY(-2px)',
        transition: 'all 0.2s ease-in-out'
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" noWrap>
            {task.name}
          </Typography>
          <Chip
            size="small"
            icon={<PriorityIcon />}
            label={task.priority}
            color={getPriorityColor(task.priority)}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            size="small"
            label={task.department}
            sx={{ bgcolor: `department.${task.department}`, color: 'white' }}
          />
          <Chip
            size="small"
            label={task.type}
            variant="outlined"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Progress
          </Typography>
          <LinearProgress
            variant="determinate"
            value={task.progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'grey.100',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4
              }
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimeIcon color="action" fontSize="small" />
            <Typography variant="body2" color="textSecondary">
              {getDaysRemaining(task.deadline)} days left
            </Typography>
          </Box>

          <Tooltip title={task.assignedTo?.name || 'Unassigned'}>
            <Avatar
              sx={{ width: 32, height: 32 }}
              src={task.assignedTo?.avatar}
            >
              <PersonIcon />
            </Avatar>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard; 