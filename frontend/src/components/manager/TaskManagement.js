import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Assignment as AssignIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const TaskManagement = ({ department }) => {
  const [filter, setFilter] = useState({
    status: 'all',
    assignee: 'all',
    priority: 'all'
  });

  const tasks = useSelector(state => 
    state.tasks.items.filter(task => task.department === department)
  );

  const teamMembers = useSelector(state =>
    state.users.items.filter(user => user.department === department)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'awaiting-approval':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Filters */}
      <Box className="mb-4 flex gap-4">
        <FormControl variant="outlined" size="small" className="min-w-[200px]">
          <InputLabel>Status</InputLabel>
          <Select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            label="Status"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="awaiting-approval">Awaiting Approval</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small" className="min-w-[200px]">
          <InputLabel>Assignee</InputLabel>
          <Select
            value={filter.assignee}
            onChange={(e) => setFilter({ ...filter, assignee: e.target.value })}
            label="Assignee"
          >
            <MenuItem value="all">All Team Members</MenuItem>
            {teamMembers.map(member => (
              <MenuItem key={member._id} value={member._id}>
                {member.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small" className="min-w-[200px]">
          <InputLabel>Priority</InputLabel>
          <Select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            label="Priority"
          >
            <MenuItem value="all">All Priorities</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Search tasks..."
          variant="outlined"
          className="flex-grow"
        />
      </Box>

      {/* Tasks Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task Name</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>{task.name}</TableCell>
                <TableCell>
                  {task.assignedTo ? (
                    <Chip
                      label={task.assignedTo.name}
                      size="small"
                      variant="outlined"
                    />
                  ) : (
                    <Button
                      size="small"
                      startIcon={<AssignIcon />}
                      variant="outlined"
                    >
                      Assign
                    </Button>
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
                    label={task.priority}
                    color={getPriorityColor(task.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(task.deadline).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton size="small">
                    <ViewIcon />
                  </IconButton>
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TaskManagement; 