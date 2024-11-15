import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';

const TaskAssignmentBoard = ({ tasks, users, onAssign, onStatusUpdate }) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const [type, id] = destination.droppableId.split('-');

    if (type === 'user') {
      onAssign(draggableId, id);
    } else if (type === 'status') {
      onStatusUpdate(draggableId, id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#fff3e0';
      case 'in_progress': return '#e3f2fd';
      case 'completed': return '#e8f5e9';
      default: return '#f5f5f5';
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* Status Columns */}
        <Grid container spacing={2}>
          {['pending', 'in_progress', 'completed'].map((status) => (
            <Grid item xs={12} md={4} key={status}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: getStatusColor(status),
                  height: '100%',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Typography>
                <Droppable droppableId={`status-${status}`}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{ minHeight: 200 }}
                    >
                      {tasks
                        .filter(task => task.status === status)
                        .map((task, index) => (
                          <Draggable
                            key={task._id}
                            draggableId={task._id}
                            index={index}
                          >
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{ mb: 1 }}
                              >
                                <CardContent>
                                  <Typography variant="subtitle2">
                                    {task.name}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {task.edition?.name}
                                  </Typography>
                                  {task.assignedTo && (
                                    <Chip
                                      avatar={<Avatar>{task.assignedTo.name[0]}</Avatar>}
                                      label={task.assignedTo.name}
                                      size="small"
                                      sx={{ mt: 1 }}
                                    />
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Team Members */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {users.map((user) => (
            <Grid item xs={12} sm={6} md={3} key={user._id}>
              <Droppable droppableId={`user-${user._id}`}>
                {(provided) => (
                  <Paper
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{ p: 2, height: '100%' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 1 }}>{user.name[0]}</Avatar>
                      <Typography variant="subtitle1">
                        {user.name}
                      </Typography>
                    </Box>
                    <Box sx={{ minHeight: 100 }}>
                      {tasks
                        .filter(task => task.assignedTo?._id === user._id)
                        .map((task, index) => (
                          <Chip
                            key={task._id}
                            label={task.name}
                            size="small"
                            sx={{ m: 0.5 }}
                          />
                        ))}
                    </Box>
                    {provided.placeholder}
                  </Paper>
                )}
              </Droppable>
            </Grid>
          ))}
        </Grid>
      </Box>
    </DragDropContext>
  );
};

export default TaskAssignmentBoard; 