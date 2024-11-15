import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  Dialog,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Upload as UploadIcon,
  Visibility as ViewIcon,
  History as VersionIcon,
  Comment as CommentIcon,
  Flag as PriorityIcon
} from '@mui/icons-material';
import FileUpload from '../files/FileUpload';
import VersionHistory from '../files/VersionHistory';
import { useAuth } from '../../contexts/AuthContext';

const DesignQueue = ({ tasks }) => {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'in_progress':
        return 'info';
      case 'review':
        return 'warning';
      case 'approved':
        return 'success';
      case 'revision':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleUpload = (task) => {
    setSelectedTask(task);
    setUploadOpen(true);
  };

  const handleVersionHistory = (task) => {
    setSelectedTask(task);
    setVersionOpen(true);
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {tasks.map((task) => (
          <Grid item xs={12} key={task._id}>
            <Card 
              elevation={2}
              sx={{ 
                borderLeft: task.priority === 'high' ? 4 : 0,
                borderColor: 'error.main'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    {task.title}
                  </Typography>
                  <Box>
                    <Chip
                      size="small"
                      label={task.type}
                      color="secondary"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      size="small"
                      label={task.status}
                      color={getStatusColor(task.status)}
                    />
                  </Box>
                </Box>

                <Typography color="textSecondary" gutterBottom>
                  {task.brand.name} {'>'} {task.edition.name}
                </Typography>

                <Box sx={{ mt: 2, mb: 1 }}>
                  <Typography variant="body2">
                    {task.description}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Tooltip title="Priority">
                    <PriorityIcon 
                      color={getPriorityColor(task.priority)} 
                      sx={{ mr: 1 }}
                    />
                  </Tooltip>
                  <Typography variant="caption" sx={{ mr: 2 }}>
                    Due: {new Date(task.deadline).toLocaleDateString()}
                  </Typography>
                  {task.comments?.length > 0 && (
                    <Chip
                      size="small"
                      icon={<CommentIcon />}
                      label={task.comments.length}
                      variant="outlined"
                    />
                  )}
                </Box>

                <LinearProgress 
                  variant="determinate" 
                  value={task.progress || 0}
                  sx={{ mt: 2 }}
                  color={getStatusColor(task.status)}
                />
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  startIcon={<ViewIcon />}
                  onClick={() => navigate(`/tasks/${task._id}`)}
                >
                  View Details
                </Button>
                <Button
                  size="small"
                  startIcon={<VersionIcon />}
                  onClick={() => handleVersionHistory(task)}
                >
                  Versions
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<UploadIcon />}
                  onClick={() => handleUpload(task)}
                  color="primary"
                >
                  Upload Design
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* File Upload Dialog */}
      <FileUpload
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        task={selectedTask}
        onUploadComplete={() => {
          setUploadOpen(false);
          setSelectedTask(null);
        }}
      />

      {/* Version History Dialog */}
      <VersionHistory
        open={versionOpen}
        onClose={() => setVersionOpen(false)}
        task={selectedTask}
      />
    </Box>
  );
};

export default DesignQueue; 