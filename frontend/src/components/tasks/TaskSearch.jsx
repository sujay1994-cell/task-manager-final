import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';
import TaskHistoryView from './TaskHistoryView';

const TaskSearch = () => {
  const [taskId, setTaskId] = useState('');
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!taskId.trim()) return;

    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/tasks/search/${taskId}`);
      setTask(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Task not found');
      setTask(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper
        component="form"
        onSubmit={handleSearch}
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <TextField
          fullWidth
          label="Search by Task ID"
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          placeholder="e.g., PRF-1234567890"
          size="small"
          sx={{ flexGrow: 1 }}
        />
        <IconButton
          type="submit"
          disabled={loading || !taskId.trim()}
          color="primary"
        >
          {loading ? <CircularProgress size={24} /> : <SearchIcon />}
        </IconButton>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {task && <TaskHistoryView task={task} />}
    </Box>
  );
};

export default TaskSearch; 