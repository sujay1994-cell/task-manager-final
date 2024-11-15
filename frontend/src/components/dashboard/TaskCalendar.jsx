import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Chip
} from '@mui/material';
import axios from 'axios';

const TaskCalendar = ({ department }) => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [department]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`/api/tasks/calendar?department=${department}`);
      const formattedTasks = response.data.map(task => ({
        id: task._id,
        title: task.title,
        start: task.deadline,
        end: task.deadline,
        backgroundColor: getTaskColor(task.department, task.status),
        borderColor: getTaskColor(task.department, task.status),
        extendedProps: {
          ...task
        }
      }));
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const getTaskColor = (taskDepartment, status) => {
    if (status === 'overdue') return '#f44336';
    
    switch (taskDepartment) {
      case 'sales':
        return '#1976d2';
      case 'editorial':
        return '#2e7d32';
      case 'design':
        return '#9c27b0';
      default:
        return '#757575';
    }
  };

  const handleEventClick = (info) => {
    setSelectedTask(info.event.extendedProps);
    setDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'review_required':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={tasks}
        eventClick={handleEventClick}
        height="350px"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
        eventDidMount={(info) => {
          // Add tooltip
          info.el.title = `${info.event.title}\nDeadline: ${new Date(info.event.start).toLocaleDateString()}`;
        }}
      />

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Task Details
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedTask.title}
              </Typography>
              
              <Typography color="textSecondary" gutterBottom>
                {selectedTask.brand?.name} {'>'} {selectedTask.edition?.name}
              </Typography>

              <Box sx={{ my: 2 }}>
                <Chip
                  label={selectedTask.status}
                  color={getStatusColor(selectedTask.status)}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={selectedTask.department}
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Typography variant="body2" paragraph>
                {selectedTask.description}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Deadline
              </Typography>
              <Typography color="textSecondary">
                {new Date(selectedTask.deadline).toLocaleDateString()}
              </Typography>

              {selectedTask.assignedTo && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Assigned To
                  </Typography>
                  <Typography color="textSecondary">
                    {selectedTask.assignedTo.name}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskCalendar; 