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
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Upload as UploadIcon,
  Palette as PaletteIcon,
  MoreVert as MoreIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import TaskCreation from '../tasks/TaskCreation';
import FileUpload from '../files/FileUpload';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const DesignDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [isTaskDialogOpen, setTaskDialogOpen] = useState(false);
  const [isFileUploadOpen, setFileUploadOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks/department/design');
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
      case 0: // Active Designs
        return tasks.filter(task => 
          !task.completed && 
          task.assignedTo === user.id &&
          task.status !== 'review_required'
        );
      case 1: // Pending Review
        return tasks.filter(task => 
          task.status === 'review_required' || 
          task.status === 'changes_requested'
        );
      case 2: // Team Tasks
        return tasks.filter(task => 
          !task.completed && 
          task.assignedTo !== user.id
        );
      case 3: // Completed
        return tasks.filter(task => task.completed);
      default:
        return tasks;
    }
  };

  const handleTaskAction = async (taskId, action) => {
    try {
      await axios.put(`/api/tasks/${taskId}/${action}`);
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, task) => {
    setSelectedTask(task);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'review_required':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      case 'changes_requested':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTaskTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'cover':
        return <ImageIcon color="primary" />;
      case 'ads':
        return <PaletteIcon color="secondary" />;
      default:
        return <EditIcon />;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Design Dashboard</Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Active Designs" />
          <Tab label="Pending Review" />
          <Tab label="Team Tasks" />
          <Tab label="Completed" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {getFilteredTasks().map((task) => (
          <Grid item xs={12} md={6} lg={4} key={task._id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getTaskTypeIcon(task.type)}
                  <Typography variant="h6">{task.title}</Typography>
                </Box>
                <Box>
                  <Chip
                    label={task.status.replace('_', ' ')}
                    color={getStatusColor(task.status)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, task)}
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <Typography color="textSecondary" gutterBottom>
                {task.brand.name} {'>'} {task.edition.name}
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                {task.description}
              </Typography>

              {task.dimensions && (
                <Typography variant="caption" display="block" gutterBottom>
                  Dimensions: {task.dimensions}
                </Typography>
              )}

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
                    <EditIcon />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Task Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleTaskAction(selectedTask?._id, 'start')}>
          Start Design
        </MenuItem>
        <MenuItem onClick={() => handleTaskAction(selectedTask?._id, 'request-review')}>
          Submit for Review
        </MenuItem>
        <MenuItem onClick={() => handleTaskAction(selectedTask?._id, 'complete')}>
          Mark as Complete
        </MenuItem>
        {selectedTask?.status === 'changes_requested' && (
          <MenuItem onClick={() => handleTaskAction(selectedTask?._id, 'acknowledge-changes')}>
            Acknowledge Changes
          </MenuItem>
        )}
      </Menu>

      {/* Task Edit Dialog */}
      <TaskCreation
        open={isTaskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false);
          setSelectedTask(null);
        }}
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
        allowedTypes={['image/jpeg', 'image/png', 'application/pdf', 'application/psd']}
      />
    </Box>
  );
};

export default DesignDashboard; 