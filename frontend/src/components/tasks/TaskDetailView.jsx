import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Divider,
  Button,
  IconButton,
  Chip,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondary,
  Tooltip
} from '@mui/material';
import {
  CloudDownload as DownloadIcon,
  History as HistoryIcon,
  Comment as CommentIcon,
  Assignment as TaskIcon,
  Person as PersonIcon,
  AttachFile as FileIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const TaskDetailView = () => {
  const { taskId } = useParams();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}`);
      setTask(response.data);
    } catch (error) {
      setError('Error fetching task details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, version) => {
    try {
      const response = await axios.get(
        `/api/tasks/${taskId}/files/${fileId}/download`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${task.taskId}_v${version}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!task) return <div>Task not found</div>;

  return (
    <Box sx={{ p: 3 }}>
      {/* Task Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">
            {task.brand.name} &gt; {task.edition.name} &gt; {task.name}
          </Typography>
          <Chip
            label={task.status}
            color={getStatusColor(task.status)}
          />
        </Box>
        <Typography color="textSecondary" gutterBottom>
          Task ID: {task.taskId}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Chip
            icon={<PersonIcon />}
            label={`Assigned to: ${task.assignedTo?.name || 'Unassigned'}`}
            variant="outlined"
            sx={{ mr: 1 }}
          />
          <Chip
            icon={<CalendarIcon />}
            label={`Deadline: ${format(new Date(task.deadline), 'PPP')}`}
            variant="outlined"
          />
        </Box>
      </Paper>

      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Files & Versions" />
          <Tab label="Timeline" />
          <Tab label="Comments" />
        </Tabs>

        {/* Files & Versions */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <List>
              {task.files.map((file, index) => (
                <ListItem
                  key={file._id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleDownload(file._id, file.version)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <FileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.originalName}
                    secondary={
                      <>
                        Version {file.version} • Uploaded by {file.uploadedBy.name} • 
                        {format(new Date(file.uploadedAt), 'PPp')}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Timeline */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Timeline>
              {task.history.map((event, index) => (
                <TimelineItem key={event._id}>
                  <TimelineOppositeContent color="textSecondary">
                    {format(new Date(event.timestamp), 'PPp')}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={getEventColor(event.action)} />
                    {index < task.history.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="body1">
                      {getEventTitle(event)}
                    </Typography>
                    {event.comment && (
                      <Typography color="textSecondary" variant="body2">
                        {event.comment}
                      </Typography>
                    )}
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Box>
        )}

        {/* Comments */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <List>
              {task.comments.map((comment) => (
                <ListItem key={comment._id} alignItems="flex-start">
                  <ListItemIcon>
                    <CommentIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {comment.user.name}
                        </Typography>
                        <Chip
                          label={comment.user.department}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block' }}
                        >
                          {comment.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(comment.createdAt), 'PPp')}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

// Helper functions for colors and labels
const getStatusColor = (status) => {
  const colors = {
    pending: 'default',
    in_progress: 'info',
    review: 'warning',
    approved: 'success',
    completed: 'success',
    changes_requested: 'error'
  };
  return colors[status] || 'default';
};

const getEventColor = (action) => {
  const colors = {
    TASK_CREATED: 'primary',
    FILE_UPLOADED: 'success',
    STATUS_CHANGED: 'info',
    COMMENT_ADDED: 'secondary',
    TASK_ASSIGNED: 'warning'
  };
  return colors[action] || 'default';
};

const getEventTitle = (event) => {
  const titles = {
    TASK_CREATED: `Task created by ${event.user.name}`,
    FILE_UPLOADED: `File uploaded by ${event.user.name}`,
    STATUS_CHANGED: `Status changed to "${event.newStatus}" by ${event.user.name}`,
    COMMENT_ADDED: `Comment added by ${event.user.name}`,
    TASK_ASSIGNED: `Task assigned to ${event.assignee.name} by ${event.user.name}`
  };
  return titles[event.action] || 'Task updated';
};

export default TaskDetailView; 