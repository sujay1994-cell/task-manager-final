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
  TimelineOppositeContent
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Edit as EditIcon,
  CheckCircle as ApproveIcon,
  Refresh as ReworkIcon,
  Done as CompleteIcon,
  Person as AssignIcon
} from '@mui/icons-material';
import axios from 'axios';

const WorkflowHistory = ({ taskId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [taskId]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching workflow history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATED':
        return <TaskIcon />;
      case 'ASSIGNED':
        return <AssignIcon />;
      case 'STARTED':
        return <EditIcon />;
      case 'SUBMITTED':
        return <CheckCircle />;
      case 'CHANGES_REQUESTED':
        return <ReworkIcon />;
      case 'APPROVED':
        return <ApproveIcon />;
      case 'COMPLETED':
        return <CompleteIcon />;
      default:
        return <EditIcon />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATED':
        return 'primary';
      case 'ASSIGNED':
        return 'info';
      case 'STARTED':
        return 'info';
      case 'SUBMITTED':
        return 'warning';
      case 'CHANGES_REQUESTED':
        return 'error';
      case 'APPROVED':
        return 'success';
      case 'COMPLETED':
        return 'success';
      default:
        return 'grey';
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Workflow History
      </Typography>
      
      <Timeline>
        {history.map((event, index) => (
          <TimelineItem key={event._id}>
            <TimelineOppositeContent color="text.secondary">
              {new Date(event.timestamp).toLocaleString()}
            </TimelineOppositeContent>
            
            <TimelineSeparator>
              <TimelineDot color={getActionColor(event.action)}>
                {getActionIcon(event.action)}
              </TimelineDot>
              {index < history.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            
            <TimelineContent>
              <Typography variant="body1">
                {event.description}
              </Typography>
              {event.feedback && (
                <Typography variant="body2" color="text.secondary">
                  Feedback: {event.feedback}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                By: {event.user.name}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  );
};

export default WorkflowHistory; 