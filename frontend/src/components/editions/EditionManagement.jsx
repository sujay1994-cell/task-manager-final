import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditionManagement = () => {
  const navigate = useNavigate();
  const [editions, setEditions] = useState([]);
  const [brands, setBrands] = useState([]);
  const [open, setOpen] = useState(false);
  const [editEdition, setEditEdition] = useState(null);
  const [formData, setFormData] = useState({
    brandId: '',
    name: '',
    releaseDate: '',
    deadline: '',
    status: 'planning'
  });

  useEffect(() => {
    fetchBrands();
    fetchEditions();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get('/api/brands');
      setBrands(response.data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchEditions = async () => {
    try {
      const response = await axios.get('/api/editions');
      setEditions(response.data);
    } catch (error) {
      console.error('Error fetching editions:', error);
    }
  };

  const handleOpen = (edition = null) => {
    if (edition) {
      setEditEdition(edition);
      setFormData({
        brandId: edition.brandId,
        name: edition.name,
        releaseDate: edition.releaseDate.split('T')[0],
        deadline: edition.deadline.split('T')[0],
        status: edition.status
      });
    } else {
      setEditEdition(null);
      setFormData({
        brandId: '',
        name: '',
        releaseDate: '',
        deadline: '',
        status: 'planning'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditEdition(null);
  };

  const handleSubmit = async () => {
    try {
      if (editEdition) {
        await axios.put(`/api/editions/${editEdition._id}`, formData);
      } else {
        await axios.post('/api/editions', formData);
      }
      fetchEditions();
      handleClose();
    } catch (error) {
      console.error('Error saving edition:', error);
    }
  };

  const handleDelete = async (editionId) => {
    if (window.confirm('Are you sure you want to delete this edition?')) {
      try {
        await axios.delete(`/api/editions/${editionId}`);
        fetchEditions();
      } catch (error) {
        console.error('Error deleting edition:', error);
      }
    }
  };

  const navigateToTasks = (editionId) => {
    navigate(`/editions/${editionId}/tasks`);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Edition Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          New Edition
        </Button>
      </Box>

      <Grid container spacing={3}>
        {editions.map((edition) => (
          <Grid item xs={12} md={4} key={edition._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{edition.name}</Typography>
                  <Box>
                    <IconButton onClick={() => navigateToTasks(edition._id)}>
                      <TaskIcon />
                    </IconButton>
                    <IconButton onClick={() => handleOpen(edition)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(edition._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography color="textSecondary">
                  Brand: {brands.find(b => b._id === edition.brandId)?.name}
                </Typography>
                <Typography variant="body2">
                  Release Date: {new Date(edition.releaseDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  Deadline: {new Date(edition.deadline).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Status: {edition.status}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editEdition ? 'Edit Edition' : 'Create New Edition'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Brand</InputLabel>
            <Select
              value={formData.brandId}
              onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
            >
              {brands.map((brand) => (
                <MenuItem key={brand._id} value={brand._id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Edition Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Release Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.releaseDate}
            onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Deadline"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="planning">Planning</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="review">Under Review</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editEdition ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditionManagement; 