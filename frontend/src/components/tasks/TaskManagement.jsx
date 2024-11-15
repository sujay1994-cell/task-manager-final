import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Assignment as TaskIcon,
  AssignmentLate as UrgentIcon,
  AssignmentTurnedIn as CompletedIcon
} from '@mui/icons-material';
import TaskCard from './TaskCard';
import TaskDialog from './TaskDialog';
import TaskFilter from './TaskFilter';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { checkPermission } from '../../utils/permissions';
import { toast } from 'react-hot-toast';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    department: '',
    type: ''
  });
  const { user } = useAuth();

  const canCreateTasks = checkPermission(user, 'canCreateTasks');
  const canViewAllTasks = checkPermission(user, 'canViewAllTasks');
  const canAssignTasks = checkPermission(user, 'canAssignTasks');

  useEffect(() => {
    fetchTasks();
  }, [user, filters]);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters, tabValue]);

  const fetchTasks = async () => {
    try {
      const url = canViewAllTasks 
        ? `/api/tasks?department=${user.department}`
        : `/api/tasks?assignedTo=${user.id}`;
      
      const response = await axios.get(url, { params: filters });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Tab filters
    switch (tabValue) {
      case 0: // Active
        filtered = filtered.filter(task => !task.completionDate);
        break;
      case 1: // Pending Review
        filtered = filtered.filter(task => task.status === 'review_required');
        break;
      case 2: // Completed
        filtered = filtered.filter(task => task.completionDate);
        break;
      default:
        break;
    }

    // Apply additional filters
    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }
    if (filters.department) {
      filtered = filtered.filter(task => task.department === filters.department);
    }
    if (filters.type) {
      filtered = filtered.filter(task => task.type === filters.type);
    }

    setFilteredTasks(filtered);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTaskAction = async (taskId, action) => {
    if (!checkPermission(user, `can${action.charAt(0).toUpperCase() + action.slice(1)}Tasks`)) {
      toast.error('You do not have permission to perform this action');
      return;
    }

    try {
      await axios.put(`/api/tasks/${taskId}/${action}`);
      await fetchTasks();
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Error updating task');
    }
  };

  const getTaskIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <UrgentIcon color="error" />;
      case 'completed':
        return <CompletedIcon color="success" />;
      default:
        return <TaskIcon color="primary" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" color="primary">
          Task Management
        </Typography>
        <Box>
          <Tooltip title="Filter Tasks">
            <IconButton onClick={(e) => setFilterAnchor(e.currentTarget)}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
          {canCreateTasks && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedTask(null);
                setOpenDialog(true);
              }}
              sx={{ ml: 1 }}
            >
              Create Task
            </Button>
          )}
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Active Tasks" />
          <Tab label="Pending Review" />
          <Tab label="Completed" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TaskFilter
            filters={filters}
            onFilterChange={setFilters}
            department={user.department}
            canViewAllDepartments={canViewAllTasks}
          />
        </Grid>

        {tasks.map(task => (
          <Grid item xs={12} md={6} lg={4} key={task._id}>
            <TaskCard
              task={task}
              onAction={handleTaskAction}
              onEdit={canAssignTasks ? handleEditTask : undefined}
              userRole={user.role}
              userDepartment={user.department}
            />
          </Grid>
        ))}
      </Grid>

      {openDialog && (
        <TaskDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onSave={handleSaveTask}
          task={selectedTask}
          department={user.department}
          canAssignTasks={canAssignTasks}
        />
      )}

      <TaskFilter
        anchorEl={filterAnchor}
        onClose={() => setFilterAnchor(null)}
        filters={filters}
        onFilterChange={setFilters}
      />
    </Box>
  );
};

export default TaskManagement; 