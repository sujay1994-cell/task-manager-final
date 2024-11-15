import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import TaskCalendar from './TaskCalendar';
import { useSelector } from 'react-redux';

const CalendarView = () => {
  const currentUser = useSelector(state => state.auth.user);
  const department = currentUser.department;

  return (
    <Container maxWidth="xl">
      <Box className="py-4">
        <Typography variant="h5" className="mb-4">
          {department} Calendar
        </Typography>
        <TaskCalendar department={department} />
      </Box>
    </Container>
  );
};

export default CalendarView; 