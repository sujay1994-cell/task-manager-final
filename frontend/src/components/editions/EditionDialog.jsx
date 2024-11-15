import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const EditionDialog = ({ open, onClose, edition, brandId, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    releaseDate: null,
    deadline: null,
    status: 'planning',
    description: '',
    teamMembers: []
  });
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (edition) {
      setFormData({
        name: edition.name,
        releaseDate: new Date(edition.releaseDate),
        deadline: new Date(edition.deadline),
        status: edition.status,
        description: edition.description || '',
        teamMembers: edition.teamMembers || []
      });
    } else {
      setFormData({
        name: '',
        releaseDate: null,
        deadline: null,
        status: 'planning',
        description: '',
        teamMembers: []
      });
    }
    fetchUsers();
  }, [edition]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.releaseDate || !formData.deadline) {
        setError('Please fill in all required fields');
        return;
      }

      const payload = {
        ...formData,
        brandId,
        releaseDate: formData.releaseDate.toISOString(),
        deadline: formData.deadline.toISOString()
      };

      if (edition) {
        await axios.put(`/api/editions/${edition._id}`, payload);
      } else {
        await axios.post('/api/editions', payload);
      }
      onSave();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving edition');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {edition ? 'Edit Edition' : 'Create New Edition'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Edition Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Release Date"
                value={formData.releaseDate}
                onChange={(date) => setFormData({ ...formData, releaseDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Deadline"
                value={formData.deadline}
                onChange={(date) => setFormData({ ...formData, deadline: date })}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="planning">Planning</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="review">Under Review</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Team Members</InputLabel>
              <Select
                multiple
                value={formData.teamMembers}
                label="Team Members"
                onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const user = users.find(u => u._id === value);
                      return user ? user.name : value;
                    })}
                  </Box>
                )}
              >
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name} ({user.department})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!formData.name || !formData.releaseDate || !formData.deadline}
        >
          {edition ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditionDialog; 