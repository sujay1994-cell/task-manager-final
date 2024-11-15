import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const Calendar = () => {
  const events = [
    {
      title: 'Editorial Meeting',
      date: '2024-01-15'
    },
    {
      title: 'Design Review',
      date: '2024-01-20'
    }
  ];

  const handleDateClick = (arg) => {
    alert('Date clicked: ' + arg.dateStr);
  };

  const handleEventClick = (arg) => {
    alert('Event clicked: ' + arg.event.title);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Calendar
      </Typography>
      <Paper sx={{ p: 2 }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay'
          }}
        />
      </Paper>
    </Box>
  );
};

export default Calendar; 