import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  Warning as WarningIcon,
  AccessTime as TimeIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';

const DeadlineTracker = () => {
  const tasks = useSelector(state => state.tasks.items);
  const currentUser = useSelector(state => state.auth.user);
  const isManager = currentUser.role === 'manager' || currentUser.role === 'admin';

  const getTaskStatus = (deadline) => {
    const today = new Date();
    const dueDate = new Date(deadline);
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 2) return 'critical';
    if (daysUntilDue <= 5) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue':
        return 'error';
      case 'critical':
        return 'warning';
      case 'warning':
        return 'info';
      default:
        return 'success';
    }
  };

  const filterTasks = () => {
    let filteredTasks = tasks.filter(task => 
      task.status !== 'completed' && 
      (isManager ? true : task.assignedTo?._id === currentUser._id)
    );

    const categorizedTasks = {
      overdue: [],
      critical: [],
      warning: [],
      normal: []
    };

    filteredTasks.forEach(task => {
      const status = getTaskStatus(task.deadline);
      categorizedTasks[status].push(task);
    });

    return categorizedTasks;
  };

  const categorizedTasks = filterTasks();
  const totalTasks = Object.values(categorizedTasks).flat().length;
  const overdueTasks = categorizedTasks.overdue.length;
  const criticalTasks = categorizedTasks.critical.length;

  const getProgressColor = () => {
    if (overdueTasks > 0) return 'error';
    if (criticalTasks > 0) return 'warning';
    return 'success';
  };

  const TaskItem = ({ task }) => {
    const status = getTaskStatus(task.deadline);
    return (
      <ListItem
        secondaryAction={
          <IconButton edge="end" size="small">
            <ArrowForwardIcon />
          </IconButton>
        }
        sx={{
          borderLeft: 3,
          borderColor: `${getStatusColor(status)}.main`,
          mb: 1,
          backgroundColor: 'background.paper',
          borderRadius: 1
        }}
      >
        <ListItemText
          primary={task.name}
          secondary={
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimeIcon fontSize="small" />
              {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
              <Chip
                label={task.department}
                size="small"
                variant="outlined"
              />
            </Box>
          }
        />
      </ListItem>
    );
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Deadline Tracker
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={((totalTasks - overdueTasks - criticalTasks) / totalTasks) * 100}
              color={getProgressColor()}
              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary">
              {overdueTasks > 0 ? `${overdueTasks} overdue` : 
               criticalTasks > 0 ? `${criticalTasks} critical` : 
               'On track'}
            </Typography>
          </Box>
        </Box>

        {categorizedTasks.overdue.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <WarningIcon fontSize="small" />
              Overdue Tasks
            </Typography>
            <List dense>
              {categorizedTasks.overdue.map(task => (
                <TaskItem key={task._id} task={task} />
              ))}
            </List>
          </Box>
        )}

        {categorizedTasks.critical.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TimeIcon fontSize="small" />
              Due Today/Tomorrow
            </Typography>
            <List dense>
              {categorizedTasks.critical.map(task => (
                <TaskItem key={task._id} task={task} />
              ))}
            </List>
          </Box>
        )}

        {categorizedTasks.warning.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="info.main" sx={{ mb: 1 }}>
              Coming Up
            </Typography>
            <List dense>
              {categorizedTasks.warning.map(task => (
                <TaskItem key={task._id} task={task} />
              ))}
            </List>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            size="small"
            endIcon={<ArrowForwardIcon />}
          >
            View All Tasks
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DeadlineTracker; 