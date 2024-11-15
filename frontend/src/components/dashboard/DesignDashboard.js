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
  Upload as UploadIcon,
  RateReview as ProofreadIcon,
  CheckCircle as ApprovalIcon,
  MoreVert as MoreVertIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';
import FileUploadModal from '../files/FileUploadModal';
import ProofreadRequestModal from './ProofreadRequestModal';
import ApprovalRequestModal from './ApprovalRequestModal';

const DesignDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [proofreadModalOpen, setProofreadModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks/department/Design');
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

  const handleUploadDesign = async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      await fetch(`/api/tasks/${selectedTask._id}/designs`, {
        method: 'POST',
        body: formData
      });

      fetchTasks();
      setUploadModalOpen(false);
    } catch (error) {
      console.error('Error uploading designs:', error);
    }
  };

  const handleProofreadRequest = async (request) => {
    try {
      await fetch(`/api/tasks/${selectedTask._id}/proofread-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      fetchTasks();
      setProofreadModalOpen(false);
    } catch (error) {
      console.error('Error requesting proofread:', error);
    }
  };

  const handleApprovalRequest = async (request) => {
    try {
      await fetch(`/api/tasks/${selectedTask._id}/approval-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      fetchTasks();
      setApprovalModalOpen(false);
    } catch (error) {
      console.error('Error requesting approval:', error);
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
      case 2: // In Review
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
        <Typography variant="h4">Design Dashboard</Typography>
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
              <Typography variant="h6" gutterBottom>Pending Review</Typography>
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
            <Tab label="In Review" />
            <Tab label="Completed" />
          </Tabs>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell>Designs</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filterTasks(tasks).map((task) => (
                  <TableRow key={task._id}>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{task.type}</TableCell>
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
                      {task.designs?.length || 0} files
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
          <UploadIcon sx={{ mr: 1 }} /> Upload Design
        </MenuItem>
        <MenuItem onClick={() => {
          setProofreadModalOpen(true);
          handleMenuClose();
        }}>
          <ProofreadIcon sx={{ mr: 1 }} /> Request Proofread
        </MenuItem>
        <MenuItem onClick={() => {
          setApprovalModalOpen(true);
          handleMenuClose();
        }}>
          <ApprovalIcon sx={{ mr: 1 }} /> Request Approval
        </MenuItem>
      </Menu>

      {/* Modals */}
      <FileUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadDesign}
        task={selectedTask}
        acceptedTypes=".psd,.ai,.pdf,.jpg,.png"
      />

      <ProofreadRequestModal
        open={proofreadModalOpen}
        onClose={() => setProofreadModalOpen(false)}
        onSubmit={handleProofreadRequest}
        task={selectedTask}
      />

      <ApprovalRequestModal
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        onSubmit={handleApprovalRequest}
        task={selectedTask}
      />
    </Box>
  );
};

export default DesignDashboard; 