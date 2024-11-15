import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';

const TaskFilters = ({ filters, onFilterChange, brands, editions }) => {
  const handleChange = (field) => (event) => {
    onFilterChange({
      ...filters,
      [field]: event.target.value
    });
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Department"
            value={filters.department}
            onChange={handleChange('department')}
          >
            <MenuItem value="">All Departments</MenuItem>
            <MenuItem value="Sales">Sales</MenuItem>
            <MenuItem value="Editorial">Editorial</MenuItem>
            <MenuItem value="Design">Design</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Edition"
            value={filters.edition}
            onChange={handleChange('edition')}
          >
            <MenuItem value="">All Editions</MenuItem>
            {editions.map(edition => (
              <MenuItem key={edition._id} value={edition._id}>
                {edition.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Status"
            value={filters.status}
            onChange={handleChange('status')}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Search"
            value={filters.search}
            onChange={handleChange('search')}
            placeholder="Search tasks..."
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskFilters; 