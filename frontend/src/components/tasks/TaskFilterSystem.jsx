import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Button,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as DateIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuth } from '../../contexts/AuthContext';
import { debouncedSearch } from '../../utils/performanceUtils';

const TaskFilterSystem = ({ onFilterChange, brands, editions }) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    edition: '',
    type: '',
    status: '',
    priority: '',
    department: user.department,
    assignedTo: '',
    dateRange: {
      start: null,
      end: null
    }
  });

  const [activeFilters, setActiveFilters] = useState([]);

  const taskTypes = [
    'Profile',
    'Cover',
    'Intro',
    'Editorial',
    'Ads'
  ];

  const statusOptions = [
    'pending',
    'in_progress',
    'review',
    'approved',
    'completed'
  ];

  useEffect(() => {
    updateActiveFilters();
  }, [filters]);

  const updateActiveFilters = () => {
    const active = Object.entries(filters)
      .filter(([key, value]) => {
        if (key === 'dateRange') {
          return value.start || value.end;
        }
        return value && value !== user.department;
      })
      .map(([key, value]) => ({
        key,
        value: key === 'dateRange' ? 'Date Filter' : value
      }));
    setActiveFilters(active);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    debouncedSearch(() => onFilterChange(newFilters));
  };

  const handleDateChange = (type, date) => {
    const newDateRange = {
      ...filters.dateRange,
      [type]: date
    };
    handleFilterChange('dateRange', newDateRange);
  };

  const clearFilter = (key) => {
    const newFilters = { ...filters };
    if (key === 'dateRange') {
      newFilters.dateRange = { start: null, end: null };
    } else {
      newFilters[key] = '';
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const defaultFilters = {
      search: '',
      brand: '',
      edition: '',
      type: '',
      status: '',
      priority: '',
      department: user.department,
      assignedTo: '',
      dateRange: { start: null, end: null }
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: filters.search && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => clearFilter('search')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Button
          sx={{ ml: 2 }}
          startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setExpanded(!expanded)}
        >
          <FilterIcon />
        </Button>
      </Box>

      {activeFilters.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {activeFilters.map(({ key, value }) => (
            <Chip
              key={key}
              label={`${key}: ${value}`}
              onDelete={() => clearFilter(key)}
              size="small"
            />
          ))}
          {activeFilters.length > 1 && (
            <Chip
              label="Clear All"
              onDelete={clearAllFilters}
              color="primary"
              size="small"
            />
          )}
        </Box>
      )}

      <Collapse in={expanded}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Brand</InputLabel>
              <Select
                value={filters.brand}
                label="Brand"
                onChange={(e) => handleFilterChange('brand', e.target.value)}
              >
                <MenuItem value="">All Brands</MenuItem>
                {brands.map((brand) => (
                  <MenuItem key={brand._id} value={brand._id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Edition</InputLabel>
              <Select
                value={filters.edition}
                label="Edition"
                onChange={(e) => handleFilterChange('edition', e.target.value)}
                disabled={!filters.brand}
              >
                <MenuItem value="">All Editions</MenuItem>
                {editions
                  .filter(e => e.brand === filters.brand)
                  .map((edition) => (
                    <MenuItem key={edition._id} value={edition._id}>
                      {edition.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Task Type</InputLabel>
              <Select
                value={filters.type}
                label="Task Type"
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                {taskTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="Start Date"
              value={filters.dateRange.start}
              onChange={(date) => handleDateChange('start', date)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="End Date"
              value={filters.dateRange.end}
              onChange={(date) => handleDateChange('end', date)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
};

export default TaskFilterSystem; 