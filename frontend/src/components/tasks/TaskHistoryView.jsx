import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  Tooltip,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/material';
import {
  CloudDownload as DownloadIcon,
  History as HistoryIcon,
  Comment as CommentIcon,
  Assignment as TaskIcon,
  Person as PersonIcon,
  AttachFile as FileIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';

const TaskHistoryView = ({ task }) => {
  const [history, setHistory] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskHistory();
    fetchTaskFiles();
  }, [task._id]);

  const fetchTaskHistory = async () => {
    try {
      const response = await axios.get(`/api/tasks/${task._id}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching task history:', error);
    }
  };

  const fetchTaskFiles = async () => {
    try {
      const response = await axios.get(`/api/tasks/${task._id}/files`);
      setFiles(response.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, version) => {
    try {
      const response = await axios.get(
        `/api/tasks/${task._id}/files/${fileId}/download`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${task.taskId}_v${version}.${response.data.type.split('/')[1]}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <Box>
      {/* Task Details Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {task.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Chip
            icon={<TaskIcon />}
            label={`ID: ${task.taskId}`}
            variant="outlined"
          />
          <Chip
            label={task.status}
            color={task.status === 'completed' ? 'success' : 'default'}
          />
        </Box>
        <Typography color="textSecondary">
          {task.description}
        </Typography>
      </Paper>

      {/* File History */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          File History
        </Typography>
        <List>
          {files.map((file) => (
            <ListItem key={file._id}>
              <ListItemIcon>
                <FileIcon />
              </ListItemIcon>
              <ListItemText
                primary={file.name}
                secondary={`Uploaded by ${file.uploadedBy.name} on ${format(new Date(file.uploadedAt), 'PPp')}`}
              />
              <ListItemSecondaryAction>
                <Tooltip title="Download File">
                  <IconButton
                    edge="end"
                    onClick={() => handleDownload(file._id, file.version)}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Task Timeline */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Task Timeline
        </Typography>
        <Timeline>
          {history.map((event, index) => (
            <TimelineItem key={event._id}>
              <TimelineOppositeContent color="textSecondary">
                {format(new Date(event.timestamp), 'PPp')}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color={getEventColor(event.action)} />
                {index < history.length - 1 && <TimelineConnector />}
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
                {event.action === 'FILE_UPLOADED' && (
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(event.fileId, event.version)}
                    sx={{ mt: 1 }}
                  >
                    Download
                  </Button>
                )}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Paper>
    </Box>
  );
};

// Helper function to determine timeline dot color
const getEventColor = (action) => {
  switch (action) {
    case 'TASK_CREATED':
      return 'primary';
    case 'STATUS_UPDATED':
      return 'info';
    case 'FILE_UPLOADED':
      return 'success';
    case 'COMMENT_ADDED':
      return 'secondary';
    case 'TASK_ASSIGNED':
      return 'warning';
    default:
      return 'grey';
  }
};

// Helper function to format event titles
const getEventTitle = (event) => {
  switch (event.action) {
    case 'TASK_CREATED':
      return `Task created by ${event.user.name}`;
    case 'STATUS_UPDATED':
      return `Status updated to "${event.newStatus}" by ${event.user.name}`;
    case 'FILE_UPLOADED':
      return `File "${event.fileName}" uploaded by ${event.user.name}`;
    case 'COMMENT_ADDED':
      return `Comment added by ${event.user.name}`;
    case 'TASK_ASSIGNED':
      return `Task assigned to ${event.assignee.name} by ${event.user.name}`;
    default:
      return event.details || 'Task updated';
  }
};

export default TaskHistoryView; 