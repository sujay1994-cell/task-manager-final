import React from 'react';
import {
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Chip,
  Tooltip,
  Typography
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  CalendarToday as DateIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { checkPermission } from '../../utils/permissions';

const TaskFilter = ({ filters, onFilterChange }) => {
  const { user } = useAuth();
  const canViewAllDepartments = checkPermission(user, 'canViewAllTasks');

  const taskTypes = [
    'Profile',
    'Cover',
    'Intro',
    'Editorial',
    'Ads'
  ];

  const handleClearFilters = () => {
    onFilterChange({
      status: '',
      priority: '',
      department: user.department,
      type: '',
      dateRange: '',
      assignedTo: ''
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Filter Tasks</Typography>
        {getActiveFilterCount() > 0 && (
          <Chip
            label={getActiveFilterCount()}
            size="small"
            color="primary"
            sx={{ ml: 1 }}
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="review_required">Review Required</MenuItem>
            <MenuItem value="changes_requested">Changes Requested</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filters.type}
            label="Type"
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
          >
            <MenuItem value="">All Types</MenuItem>
            {taskTypes.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={filters.priority}
            label="Priority"
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
          >
            <MenuItem value="">All Priorities</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>

        {canViewAllDepartments && (
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={filters.department}
              label="Department"
              onChange={(e) => onFilterChange({ ...filters, department: e.target.value })}
            >
              <MenuItem value="">All Departments</MenuItem>
              <MenuItem value="sales">Sales</MenuItem>
              <MenuItem value="editorial">Editorial</MenuItem>
              <MenuItem value="design">Design</MenuItem>
            </Select>
          </FormControl>
        )}

        <FormControl sx={{ minWidth: 200 }}>
          <TextField
            label="Date Range"
            type="date"
            value={filters.dateRange}
            onChange={(e) => onFilterChange({ ...filters, dateRange: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: <DateIcon color="action" sx={{ mr: 1 }} />
            }}
          />
        </FormControl>

        {getActiveFilterCount() > 0 && (
          <Tooltip title="Clear Filters">
            <IconButton 
              onClick={handleClearFilters}
              color="primary"
              sx={{ height: 'fit-content', alignSelf: 'center' }}
            >
              <ClearIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {filters.status === 'overdue' && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="error">
            Showing overdue tasks only
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default TaskFilter; 