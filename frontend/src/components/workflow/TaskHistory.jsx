import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Chip,
  IconButton,
  Collapse,
  Button
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Edit as EditIcon,
  Send as SubmitIcon,
  CheckCircle as ApproveIcon,
  Refresh as RevisionIcon,
  Done as CompleteIcon,
  Person as AssignIcon,
  ExpandMore as ExpandMoreIcon,
  AttachFile as FileIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const TaskHistory = ({ taskId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [taskId]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching task history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'CREATED':
        return <TaskIcon />;
      case 'ASSIGNED':
        return <AssignIcon />;
      case 'EDITED':
        return <EditIcon />;
      case 'SUBMITTED':
        return <SubmitIcon />;
      case 'APPROVED':
        return <ApproveIcon />;
      case 'REVISION':
        return <RevisionIcon />;
      case 'COMPLETED':
        return <CompleteIcon />;
      case 'FILE_UPLOADED':
        return <FileIcon />;
      default:
        return <EditIcon />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'CREATED':
        return 'grey';
      case 'ASSIGNED':
        return 'info';
      case 'SUBMITTED':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REVISION':
        return 'error';
      case 'COMPLETED':
        return 'success';
      default:
        return 'primary';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Task History
      </Typography>

      <Timeline>
        {history.map((event, index) => (
          <TimelineItem key={event._id}>
            <TimelineOppositeContent color="text.secondary">
              {formatDate(event.timestamp)}
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot color={getEventColor(event.type)}>
                {getEventIcon(event.type)}
              </TimelineDot>
              {index < history.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle1">
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    by {event.user.name} ({event.user.department})
                  </Typography>
                </Box>
                {(event.changes?.length > 0 || event.files?.length > 0) && (
                  <IconButton
                    size="small"
                    onClick={() => setExpandedItem(expandedItem === event._id ? null : event._id)}
                    sx={{
                      transform: expandedItem === event._id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s'
                    }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                )}
              </Box>

              <Collapse in={expandedItem === event._id}>
                <Box sx={{ mt: 1 }}>
                  {event.changes?.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Changes:
                      </Typography>
                      {event.changes.map((change, idx) => (
                        <Chip
                          key={idx}
                          label={change}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}

                  {event.files?.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Files:
                      </Typography>
                      {event.files.map((file, idx) => (
                        <Button
                          key={idx}
                          size="small"
                          startIcon={<FileIcon />}
                          onClick={() => window.open(file.url)}
                          sx={{ mr: 1, mb: 1 }}
                        >
                          {file.filename}
                        </Button>
                      ))}
                    </Box>
                  )}

                  {event.feedback && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Feedback:
                      </Typography>
                      <Typography variant="body2">
                        {event.feedback}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  );
};

export default TaskHistory; 