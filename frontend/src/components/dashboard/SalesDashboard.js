import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Assignment as TaskIcon,
  Description as FileIcon,
  People as ClientIcon
} from '@mui/icons-material';
import CreateTaskModal from '../tasks/CreateTaskModal';
import FileUploadModal from '../files/FileUploadModal';
import ClientFeedbackModal from '../clients/ClientFeedbackModal';
import TaskCalendar from '../calendar/TaskCalendar';
import TaskDetailsDialog from '../calendar/TaskDetailsDialog';

const SalesDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch tasks from API
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/dashboard/sales', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      });
      const data = await response.json();
      setTasks([...tasks, data]);
      setCreateTaskOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleMenuClick = (event, task) => {
    setSelectedTask(task);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUploadFiles = async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      await fetch(`/api/tasks/${selectedTask._id}/attachments`, {
        method: 'POST',
        body: formData
      });

      fetchTasks();
      setUploadModalOpen(false);
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Sales Dashboard</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateTaskOpen(true)}
        >
          Create Task
        </Button>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Active Tasks</Typography>
              <Typography variant="h3">
                {tasks.filter(t => t.status !== 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Client Materials</Typography>
              <Typography variant="h3">
                {tasks.reduce((acc, t) => acc + (t.attachments?.length || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Pending Feedback</Typography>
              <Typography variant="h3">
                {tasks.filter(t => t.status === 'review').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tasks Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Tasks</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell>Materials</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task._id}>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{task.department}</TableCell>
                    <TableCell>{task.assignedTo?.name || 'Unassigned'}</TableCell>
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
                    <TableCell>
                      {task.attachments?.length || 0} files
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => handleMenuClick(e, task)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          setUploadModalOpen(true);
          handleMenuClose();
        }}>
          <FileIcon sx={{ mr: 1 }} /> Upload Materials
        </MenuItem>
        <MenuItem onClick={() => {
          setFeedbackModalOpen(true);
          handleMenuClose();
        }}>
          <ClientIcon sx={{ mr: 1 }} /> Add Client Feedback
        </MenuItem>
      </Menu>

      {/* Modals */}
      <CreateTaskModal
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        onSubmit={handleCreateTask}
      />

      <FileUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadFiles}
        task={selectedTask}
      />

      <ClientFeedbackModal
        open={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        task={selectedTask}
        onSubmit={async (feedback) => {
          try {
            await fetch(`/api/tasks/${selectedTask._id}/feedback`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ feedback })
            });
            fetchTasks();
            setFeedbackModalOpen(false);
          } catch (error) {
            console.error('Error adding feedback:', error);
          }
        }}
      />

      {/* Calendar Section */}
      <Grid item xs={12}>
        <TaskCalendar 
          tasks={tasks}
          onEventClick={handleEventClick}
        />
      </Grid>

      <TaskDetailsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        event={selectedEvent}
      />
    </Box>
  );
};

export default SalesDashboard; 