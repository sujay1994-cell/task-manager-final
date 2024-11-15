import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Box,
  Card,
  Typography,
  Chip,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  LinearProgress
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    department: 'all',
    edition: 'all',
    type: 'all',
    search: ''
  });

  const columns = {
    pending: {
      id: 'pending',
      title: 'Pending',
      color: 'status.pending'
    },
    inProgress: {
      id: 'inProgress',
      title: 'In Progress',
      color: 'status.inProgress'
    },
    review: {
      id: 'review',
      title: 'In Review',
      color: 'status.review'
    },
    completed: {
      id: 'completed',
      title: 'Completed',
      color: 'status.completed'
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Reorder within same column
      const column = tasks[source.droppableId];
      const newTaskIds = Array.from(column.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      setTasks({
        ...tasks,
        [source.droppableId]: {
          ...column,
          taskIds: newTaskIds
        }
      });
    } else {
      // Move to different column
      const sourceColumn = tasks[source.droppableId];
      const destColumn = tasks[destination.droppableId];
      const sourceTaskIds = Array.from(sourceColumn.taskIds);
      const destTaskIds = Array.from(destColumn.taskIds);

      sourceTaskIds.splice(source.index, 1);
      destTaskIds.splice(destination.index, 0, draggableId);

      setTasks({
        ...tasks,
        [source.droppableId]: {
          ...sourceColumn,
          taskIds: sourceTaskIds
        },
        [destination.droppableId]: {
          ...destColumn,
          taskIds: destTaskIds
        }
      });

      // Update task status in backend
      await updateTaskStatus(draggableId, destination.droppableId);
    }
  };

  const filterTasks = (tasks) => {
    return tasks.filter(task => {
      const matchesDepartment = filters.department === 'all' || task.department === filters.department;
      const matchesEdition = filters.edition === 'all' || task.edition === filters.edition;
      const matchesType = filters.type === 'all' || task.type === filters.type;
      const matchesSearch = task.name.toLowerCase().includes(filters.search.toLowerCase());

      return matchesDepartment && matchesEdition && matchesType && matchesSearch;
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          size="small"
          sx={{ width: 200 }}
          InputProps={{
            startAdornment: <SearchIcon color="action" />
          }}
        />

        <FormControl size="small" sx={{ width: 150 }}>
          <InputLabel>Department</InputLabel>
          <Select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            label="Department"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="sales">Sales</MenuItem>
            <MenuItem value="editorial">Editorial</MenuItem>
            <MenuItem value="design">Design</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: 150 }}>
          <InputLabel>Edition</InputLabel>
          <Select
            value={filters.edition}
            onChange={(e) => setFilters({ ...filters, edition: e.target.value })}
            label="Edition"
          >
            <MenuItem value="all">All</MenuItem>
            {/* Add editions dynamically */}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            label="Type"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="profile">Profile</MenuItem>
            <MenuItem value="cover">Cover</MenuItem>
            <MenuItem value="editorial">Editorial</MenuItem>
            <MenuItem value="ads">Ads</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Task Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={3}>
          {Object.values(columns).map(column => (
            <Grid item xs={12} md={3} key={column.id}>
              <Card sx={{ bgcolor: column.color, p: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                  {column.title}
                </Typography>
                
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{ minHeight: 500 }}
                    >
                      {filterTasks(tasks[column.id]?.tasks || []).map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{ mb: 2, p: 2 }}
                            >
                              <Typography variant="subtitle1" gutterBottom>
                                {task.name}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <Chip
                                  label={task.department}
                                  size="small"
                                  sx={{ bgcolor: `department.${task.department}` }}
                                />
                                <Chip
                                  label={task.type}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>

                              <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="textSecondary">
                                  Progress
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={task.progress}
                                  sx={{ mt: 0.5 }}
                                />
                              </Box>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>
    </Box>
  );
};

export default TaskBoard; 