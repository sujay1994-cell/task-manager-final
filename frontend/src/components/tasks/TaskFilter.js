import React from 'react';
import {
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Chip,
  IconButton,
  Typography
} from '@mui/material';
import { Close as CloseIcon, FilterList as FilterIcon } from '@mui/icons-material';

const TaskFilter = ({ filters, onFilterChange, onClearFilters }) => {
  const departments = ['All', 'Sales', 'Editorial', 'Design'];
  const statuses = [
    'All',
    'created',
    'assigned',
    'in-progress',
    'awaiting-approval',
    'revisions',
    'completed'
  ];

  const handleChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value === 'All' ? '' : value
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value && value !== '').length;
  };

  return (
    <Paper className="p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <FilterIcon className="mr-2" />
          <Typography variant="h6">Filter Tasks</Typography>
        </div>
        {getActiveFilterCount() > 0 && (
          <Chip
            label={`${getActiveFilterCount()} active filters`}
            onDelete={onClearFilters}
            size="small"
            color="primary"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormControl fullWidth>
          <InputLabel>Department</InputLabel>
          <Select
            value={filters.department || 'All'}
            onChange={(e) => handleChange('department', e.target.value)}
            label="Department"
          >
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status || 'All'}
            onChange={(e) => handleChange('status', e.target.value)}
            label="Status"
          >
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Search"
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="Search by task name..."
        />
      </div>

      {/* Active Filters */}
      {getActiveFilterCount() > 0 && (
        <Box className="mt-4 flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (value && value !== '') {
              return (
                <Chip
                  key={key}
                  label={`${key}: ${value}`}
                  onDelete={() => handleChange(key, '')}
                  size="small"
                />
              );
            }
            return null;
          })}
        </Box>
      )}
    </Paper>
  );
};

export default TaskFilter; 