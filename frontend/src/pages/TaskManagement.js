import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskList from '../components/tasks/TaskList';
import CreateTaskForm from '../components/tasks/CreateTaskForm';
import TaskAssignmentBoard from '../components/tasks/TaskAssignmentBoard';
import { useAuth } from '../context/AuthContext';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [brands, setBrands] = useState([]);
  const [editions, setEditions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: '',
    edition: '',
    status: '',
    search: '',
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [tasksRes, brandsRes, editionsRes, usersRes] = await Promise.all([
        fetch('/api/tasks', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/brands', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/editions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const [tasksData, brandsData, editionsData, usersData] = await Promise.all([
        tasksRes.json(),
        brandsRes.json(),
        editionsRes.json(),
        usersRes.json()
      ]);

      setTasks(tasksData);
      setBrands(brandsData);
      setEditions(editionsData);
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(taskData)
      });

      const newTask = await response.json();
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      const updatedTask = await response.json();
      setTasks(tasks.map(task => 
        task._id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleAssignTask = async (taskId, userId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ assignedTo: userId })
      });

      const updatedTask = await response.json();
      setTasks(tasks.map(task => 
        task._id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Error assigning task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    return (
      (!filters.department || task.department === filters.department) &&
      (!filters.edition || task.edition === filters.edition) &&
      (!filters.status || task.status === filters.status) &&
      (!filters.search || 
        task.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Task Management
      </Typography>

      <Grid container spacing={3}>
        {/* Create Task Form */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Create New Task
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <CreateTaskForm
              brands={brands}
              editions={editions}
              users={users}
              onSubmit={handleCreateTask}
            />
          </Paper>
        </Grid>

        {/* Task List and Filters */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <TaskFilters
              filters={filters}
              onFilterChange={setFilters}
              brands={brands}
              editions={editions}
            />
            <Divider sx={{ my: 2 }} />
            <TaskList
              tasks={filteredTasks}
              onStatusUpdate={handleUpdateTaskStatus}
              onAssign={handleAssignTask}
              users={users}
            />
          </Paper>
        </Grid>

        {/* Task Assignment Board */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Task Assignment Board
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TaskAssignmentBoard
              tasks={filteredTasks}
              users={users}
              onAssign={handleAssignTask}
              onStatusUpdate={handleUpdateTaskStatus}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskManagement; 