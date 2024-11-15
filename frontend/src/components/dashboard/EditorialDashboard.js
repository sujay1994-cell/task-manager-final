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
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Upload as UploadIcon,
  People as TeamIcon,
  Comment as FeedbackIcon
} from '@mui/icons-material';
import FileUploadModal from '../files/FileUploadModal';
import TeamAssignmentModal from '../team/TeamAssignmentModal';
import FeedbackRequestModal from '../feedback/FeedbackRequestModal';

const EditorialDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks/department/Editorial');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
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

  const handleAssignTeam = async (teamMembers) => {
    try {
      await fetch(`/api/tasks/${selectedTask._id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamMembers })
      });

      fetchTasks();
      setAssignModalOpen(false);
    } catch (error) {
      console.error('Error assigning team:', error);
    }
  };

  const handleRequestFeedback = async (feedback) => {
    try {
      await fetch(`/api/tasks/${selectedTask._id}/feedback-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback })
      });

      fetchTasks();
      setFeedbackModalOpen(false);
    } catch (error) {
      console.error('Error requesting feedback:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'review': return 'warning';
      case 'revision': return 'error';
      default: return 'default';
    }
  };

  const filterTasks = (tasks) => {
    switch (tabValue) {
      case 0: // All
        return tasks;
      case 1: // In Progress
        return tasks.filter(t => t.status === 'in-progress');
      case 2: // Review
        return tasks.filter(t => t.status === 'review');
      case 3: // Completed
        return tasks.filter(t => t.status === 'completed');
      default:
        return tasks;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Editorial Dashboard</Typography>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Tasks</Typography>
              <Typography variant="h3">{tasks.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>In Progress</Typography>
              <Typography variant="h3">
                {tasks.filter(t => t.status === 'in-progress').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Under Review</Typography>
              <Typography variant="h3">
                {tasks.filter(t => t.status === 'review').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Completed</Typography>
              <Typography variant="h3">
                {tasks.filter(t => t.status === 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tasks Section */}
      <Card>
        <CardContent>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="All Tasks" />
            <Tab label="In Progress" />
            <Tab label="Under Review" />
            <Tab label="Completed" />
          </Tabs>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task Name</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell>Files</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filterTasks(tasks).map((task) => (
                  <TableRow key={task._id}>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>
                      {task.assignedTo?.name || 'Unassigned'}
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
          <UploadIcon sx={{ mr: 1 }} /> Upload Files
        </MenuItem>
        <MenuItem onClick={() => {
          setAssignModalOpen(true);
          handleMenuClose();
        }}>
          <TeamIcon sx={{ mr: 1 }} /> Assign Team
        </MenuItem>
        <MenuItem onClick={() => {
          setFeedbackModalOpen(true);
          handleMenuClose();
        }}>
          <FeedbackIcon sx={{ mr: 1 }} /> Request Feedback
        </MenuItem>
      </Menu>

      {/* Modals */}
      <FileUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadFiles}
        task={selectedTask}
      />

      <TeamAssignmentModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSubmit={handleAssignTeam}
        task={selectedTask}
      />

      <FeedbackRequestModal
        open={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmit={handleRequestFeedback}
        task={selectedTask}
      />
    </Box>
  );
};

export default EditorialDashboard; 