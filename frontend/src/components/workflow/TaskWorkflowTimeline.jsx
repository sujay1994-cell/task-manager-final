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
  Tooltip
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Person as AssignIcon,
  Edit as EditIcon,
  Send as SubmitIcon,
  CheckCircle as ApproveIcon,
  Refresh as RevisionIcon,
  Done as CompleteIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';

const TaskWorkflowTimeline = ({ taskId }) => {
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimelineEvents();
  }, [taskId]);

  const fetchTimelineEvents = async () => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}/timeline`);
      setTimelineEvents(response.data);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'CREATED':
        return <TaskIcon />;
      case 'ASSIGNED':
        return <AssignIcon />;
      case 'STARTED':
        return <EditIcon />;
      case 'SUBMITTED':
        return <SubmitIcon />;
      case 'APPROVED':
        return <ApproveIcon />;
      case 'REVISION':
        return <RevisionIcon />;
      case 'COMPLETED':
        return <CompleteIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'CREATED':
        return 'grey';
      case 'ASSIGNED':
        return 'info';
      case 'STARTED':
        return 'primary';
      case 'SUBMITTED':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REVISION':
        return 'error';
      case 'COMPLETED':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diff = Math.abs(end - start);
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h`;
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Task Timeline</Typography>
        <Chip 
          label={timelineEvents[0]?.status || 'Pending'} 
          color={getEventColor(timelineEvents[0]?.type)}
          size="small"
        />
      </Box>

      <Timeline>
        {timelineEvents.map((event, index) => (
          <TimelineItem key={event._id}>
            <TimelineOppositeContent sx={{ flex: 0.3 }}>
              <Typography variant="caption" color="text.secondary">
                {new Date(event.timestamp).toLocaleString()}
              </Typography>
              {event.duration && (
                <Typography variant="caption" display="block" color="text.secondary">
                  Duration: {formatDuration(event.timestamp, event.endTimestamp)}
                </Typography>
              )}
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot color={getEventColor(event.type)}>
                {getEventIcon(event.type)}
              </TimelineDot>
              {index < timelineEvents.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2">
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.description}
                  </Typography>
                  {event.user && (
                    <Typography variant="caption" color="text.secondary">
                      By: {event.user.name}
                    </Typography>
                  )}
                </Box>
                {event.metadata && (
                  <Tooltip title="Additional Information">
                    <IconButton size="small" onClick={() => console.log(event.metadata)}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {event.feedback && (
                <Paper variant="outlined" sx={{ mt: 1, p: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Feedback: {event.feedback}
                  </Typography>
                </Paper>
              )}

              {event.changes && event.changes.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {event.changes.map((change, idx) => (
                    <Chip
                      key={idx}
                      label={change}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  );
};

export default TaskWorkflowTimeline; 