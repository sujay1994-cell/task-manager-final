import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  CircularProgress
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../../contexts/AuthContext';
import {
  Event as EventIcon,
  Assignment as TaskIcon,
  Warning as WarningIcon,
  CheckCircle as CompleteIcon
} from '@mui/icons-material';
import axios from 'axios';

const EnhancedTaskCalendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchCalendarEvents();
  }, [user]);

  const fetchCalendarEvents = async () => {
    try {
      // Fetch tasks
      const tasksResponse = await axios.get('/api/calendar/tasks', {
        params: {
          department: user.department,
          role: user.role
        }
      });

      // Fetch launch events
      const launchResponse = await axios.get('/api/calendar/launch-events', {
        params: {
          department: user.department
        }
      });

      // Combine and format events
      const formattedEvents = [
        ...formatTaskEvents(tasksResponse.data),
        ...formatLaunchEvents(launchResponse.data)
      ];

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTaskEvents = (tasks) => {
    return tasks.map(task => ({
      id: task._id,
      title: `${task.brand.name} > ${task.edition.name} > ${task.name}`,
      start: task.deadline,
      end: task.deadline,
      color: getEventColor(task.status),
      extendedProps: {
        type: 'task',
        status: task.status,
        assignedTo: task.assignedTo,
        taskId: task.taskId
      }
    }));
  };

  const formatLaunchEvents = (launches) => {
    return launches.map(launch => ({
      id: launch._id,
      title: launch.title,
      start: launch.date,
      end: launch.date,
      color: '#9c27b0', // Purple for launch events
      extendedProps: {
        type: 'launch',
        details: launch.details,
        editionId: launch.edition
      }
    }));
  };

  const getEventColor = (status) => {
    switch (status) {
      case 'overdue':
        return '#f44336'; // Red
      case 'in_progress':
        return '#2196f3'; // Blue
      case 'completed':
        return '#4caf50'; // Green
      case 'review':
        return '#ff9800'; // Orange
      default:
        return '#757575'; // Grey
    }
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
  };

  const navigateToTask = (taskId) => {
    window.location.href = `/tasks/${taskId}`;
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
          eventDidMount={(info) => {
            // Add tooltips
            const type = info.event.extendedProps.type;
            const status = info.event.extendedProps.status;
            info.el.title = `${info.event.title}\n${type === 'task' ? `Status: ${status}` : 'Launch Event'}`;
          }}
        />
      </Paper>

      {/* Event Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                {selectedEvent.extendedProps.type === 'task' ? (
                  <TaskIcon />
                ) : (
                  <EventIcon />
                )}
                {selectedEvent.title}
              </Box>
            </DialogTitle>
            <DialogContent>
              {selectedEvent.extendedProps.type === 'task' ? (
                <>
                  <Typography variant="body1" gutterBottom>
                    Task ID: {selectedEvent.extendedProps.taskId}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Deadline: {new Date(selectedEvent.start).toLocaleString()}
                  </Typography>
                  <Chip
                    label={selectedEvent.extendedProps.status}
                    color={selectedEvent.extendedProps.status === 'overdue' ? 'error' : 'default'}
                    icon={selectedEvent.extendedProps.status === 'overdue' ? <WarningIcon /> : undefined}
                    sx={{ mt: 1 }}
                  />
                </>
              ) : (
                <>
                  <Typography variant="body1" gutterBottom>
                    Launch Event
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedEvent.extendedProps.details}
                  </Typography>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Close</Button>
              {selectedEvent.extendedProps.type === 'task' && (
                <Button
                  variant="contained"
                  onClick={() => navigateToTask(selectedEvent.extendedProps.taskId)}
                >
                  View Task
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default EnhancedTaskCalendar; 