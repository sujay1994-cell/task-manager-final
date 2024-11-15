import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Paper, Typography } from '@mui/material';

const TaskCalendar = ({ tasks, onEventClick }) => {
  // Transform tasks into calendar events
  const events = tasks.map(task => ({
    id: task._id,
    title: task.name,
    start: task.deadline,
    backgroundColor: getStatusColor(task.status),
    borderColor: getStatusColor(task.status),
    extendedProps: {
      department: task.department,
      status: task.status,
      assignedTo: task.assignedTo?.name
    }
  }));

  function getStatusColor(status) {
    switch (status) {
      case 'pending':
        return '#ffc107'; // warning
      case 'in_progress':
        return '#2196f3'; // primary
      case 'completed':
        return '#4caf50'; // success
      case 'in_review':
        return '#ff9800'; // orange
      default:
        return '#757575'; // default grey
    }
  }

  const handleEventClick = (clickInfo) => {
    onEventClick && onEventClick(clickInfo.event);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, height: '600px' }}>
      <Typography variant="h6" gutterBottom>
        Task Calendar
      </Typography>
      <Box sx={{ height: 'calc(100% - 40px)' }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
          eventContent={(eventInfo) => (
            <Box sx={{ p: 0.5 }}>
              <Typography variant="caption" sx={{ display: 'block' }}>
                {eventInfo.event.title}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', fontSize: '0.75rem' }}>
                {eventInfo.event.extendedProps.department}
              </Typography>
            </Box>
          )}
          height="100%"
        />
      </Box>
    </Paper>
  );
};

export default TaskCalendar; 