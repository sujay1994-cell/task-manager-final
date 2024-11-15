import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { useSelector } from 'react-redux';

const UserTasksOverview = ({ user }) => {
  const [filter, setFilter] = useState('all');
  const tasks = useSelector(state => state.tasks.items);

  if (!user) {
    return (
      <Box className="text-center py-8">
        <Typography color="textSecondary">
          Select a user to view their tasks
        </Typography>
      </Box>
    );
  }

  const userTasks = tasks.filter(task => 
    task.assignedTo?._id === user._id &&
    (filter === 'all' || task.status === filter)
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

  const taskStats = {
    total: userTasks.length,
    completed: userTasks.filter(task => task.status === 'completed').length,
    inProgress: userTasks.filter(task => task.status === 'in-progress').length,
    pending: userTasks.filter(task => task.status === 'awaiting-approval').length
  };

  return (
    <Box>
      {/* Task Statistics */}
      <Grid container spacing={3} className="mb-4">
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Tasks</Typography>
              <Typography variant="h3">{taskStats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Completed</Typography>
              <Typography variant="h3" color="success.main">
                {taskStats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>In Progress</Typography>
              <Typography variant="h3" color="primary.main">
                {taskStats.inProgress}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Pending Approval</Typography>
              <Typography variant="h3" color="warning.main">
                {taskStats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Task List */}
      <Card>
        <CardContent>
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h6">
              Tasks for {user.name}
            </Typography>
            <FormControl size="small" style={{ minWidth: 200 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="all">All Tasks</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="awaiting-approval">Awaiting Approval</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task Name</TableCell>
                  <TableCell>Edition</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Deadline</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userTasks.map((task) => (
                  <TableRow key={task._id}>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{task.edition?.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={task.department}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.status}
                        color={getStatusColor(task.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(task.deadline).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {userTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="textSecondary">
                        No tasks found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserTasksOverview; 