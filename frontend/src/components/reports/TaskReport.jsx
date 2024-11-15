import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip
} from '@mui/material';
import {
  GetApp as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
import axios from 'axios';

const TaskReport = ({ brand, edition }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState('week');

  useEffect(() => {
    fetchTasks();
  }, [reportType, dateRange, brand, edition]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/reports/tasks', {
        params: {
          brand,
          edition,
          type: reportType,
          dateRange,
          department: user.department
        }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching task report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const data = tasks.map(task => ({
      'Task Name': task.title,
      'Brand': task.brand.name,
      'Edition': task.edition.name,
      'Type': task.type,
      'Status': task.status,
      'Assigned To': task.assignedTo?.name || 'Unassigned',
      'Created Date': new Date(task.createdAt).toLocaleDateString(),
      'Due Date': new Date(task.deadline).toLocaleDateString(),
      'Completion Date': task.completedAt ? new Date(task.completedAt).toLocaleDateString() : '-'
    }));

    exportToExcel(data, `task-report-${new Date().toISOString()}`);
  };

  const handleExportPDF = () => {
    exportToPDF(tasks, `task-report-${new Date().toISOString()}`);
  };

  const handleEmailReport = async () => {
    try {
      await axios.post('/api/reports/email', {
        type: 'task',
        reportType,
        dateRange,
        brand,
        edition
      });
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'review': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Task Report</Typography>
        <Box>
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
            sx={{ mr: 1 }}
          >
            Export Excel
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleExportPDF}
            sx={{ mr: 1 }}
          >
            Export PDF
          </Button>
          <Button
            startIcon={<EmailIcon />}
            onClick={handleEmailReport}
          >
            Email Report
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              label="Report Type"
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="all">All Tasks</MenuItem>
              <MenuItem value="completed">Completed Tasks</MenuItem>
              <MenuItem value="overdue">Overdue Tasks</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              label="Date Range"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task Name</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Edition</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Completion Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((task) => (
                <TableRow key={task._id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.brand.name}</TableCell>
                  <TableCell>{task.edition.name}</TableCell>
                  <TableCell>
                    <Chip label={task.type} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{task.assignedTo?.name || 'Unassigned'}</TableCell>
                  <TableCell>{new Date(task.deadline).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {task.completedAt ? 
                      new Date(task.completedAt).toLocaleDateString() : 
                      '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={tasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>
    </Box>
  );
};

export default TaskReport; 