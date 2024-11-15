import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';

const TaskList = ({ tasks, onStatusUpdate, onAssign, users }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleMenuClick = (event, task) => {
    setSelectedTask(task);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task Name</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Edition</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>
                  <Typography variant="body2">{task.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {task.description}
                  </Typography>
                </TableCell>
                <TableCell>{task.brand?.name}</TableCell>
                <TableCell>{task.edition?.name}</TableCell>
                <TableCell>
                  {task.assignedTo ? (
                    <Chip
                      icon={<PersonIcon />}
                      label={task.assignedTo.name}
                      size="small"
                      variant="outlined"
                    />
                  ) : (
                    <Chip label="Unassigned" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.status}
                    color={getStatusColor(task.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    icon={<FlagIcon />}
                    label={task.priority}
                    color={getPriorityColor(task.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(task.deadline).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, task)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">Change Status</Typography>
        </MenuItem>
        <MenuItem onClick={() => {
          onStatusUpdate(selectedTask._id, 'pending');
          handleMenuClose();
        }}>
          Set as Pending
        </MenuItem>
        <MenuItem onClick={() => {
          onStatusUpdate(selectedTask._id, 'in_progress');
          handleMenuClose();
        }}>
          Set as In Progress
        </MenuItem>
        <MenuItem onClick={() => {
          onStatusUpdate(selectedTask._id, 'completed');
          handleMenuClose();
        }}>
          Set as Completed
        </MenuItem>
        <MenuItem divider disabled>
          <Typography variant="subtitle2">Assign To</Typography>
        </MenuItem>
        {users.map(user => (
          <MenuItem
            key={user._id}
            onClick={() => {
              onAssign(selectedTask._id, user._id);
              handleMenuClose();
            }}
          >
            {user.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default TaskList; 