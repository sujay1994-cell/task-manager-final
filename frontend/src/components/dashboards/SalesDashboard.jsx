import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';
import TaskCreation from '../tasks/TaskCreation';
import FileUpload from '../files/FileUpload';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const SalesDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [isTaskDialogOpen, setTaskDialogOpen] = useState(false);
  const [isFileUploadOpen, setFileUploadOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks/department/sales');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getFilteredTasks = () => {
    switch (tabValue) {
      case 0: // Current Tasks
        return tasks.filter(task => !task.completed);
      case 1: // Awaiting Approval
        return tasks.filter(task => task.status === 'awaiting_approval');
      case 2: // Client Feedback
        return tasks.filter(task => task.status === 'client_feedback');
      case 3: // Completed
        return tasks.filter(task => task.completed);
      default:
        return tasks;
    }
  };

  const handleTaskCreated = async (newTask) => {
    await fetchTasks();
    setTaskDialogOpen(false);
  };

  const handleFileUploaded = async (taskId, files) => {
    await fetchTasks();
    setFileUploadOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'awaiting_approval':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      case 'client_feedback':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Sales Dashboard</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setTaskDialogOpen(true)}
        >
          Create Task
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Current Tasks" />
          <Tab label="Awaiting Approval" />
          <Tab label="Client Feedback" />
          <Tab label="Completed" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {getFilteredTasks().map((task) => (
          <Grid item xs={12} md={6} lg={4} key={task._id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">{task.title}</Typography>
                <Chip
                  label={task.status.replace('_', ' ')}
                  color={getStatusColor(task.status)}
                  size="small"
                />
              </Box>
              
              <Typography color="textSecondary" gutterBottom>
                {task.brand.name} {'>>'} {task.edition.name}
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                {task.description}
              </Typography>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption">
                  Due: {new Date(task.deadline).toLocaleDateString()}
                </Typography>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedTask(task);
                      setFileUploadOpen(true);
                    }}
                  >
                    <UploadIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedTask(task);
                      setTaskDialogOpen(true);
                    }}
                  >
                    <TaskIcon />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Task Creation Dialog */}
      <TaskCreation
        open={isTaskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false);
          setSelectedTask(null);
        }}
        onTaskCreated={handleTaskCreated}
        editTask={selectedTask}
      />

      {/* File Upload Dialog */}
      <FileUpload
        open={isFileUploadOpen}
        onClose={() => {
          setFileUploadOpen(false);
          setSelectedTask(null);
        }}
        taskId={selectedTask?._id}
        onFileUploaded={handleFileUploaded}
      />
    </Box>
  );
};

export default SalesDashboard; 