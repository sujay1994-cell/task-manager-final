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
  Alert
} from '@mui/material';
import axios from 'axios';

const BrandDialog = ({ open, onClose, brand, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'monthly',
    status: 'active'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name,
        description: brand.description,
        frequency: brand.frequency,
        status: brand.status
      });
    } else {
      setFormData({
        name: '',
        description: '',
        frequency: 'monthly',
        status: 'active'
      });
    }
  }, [brand]);

  const handleSubmit = async () => {
    try {
      if (brand) {
        await axios.put(`/api/brands/${brand._id}`, formData);
      } else {
        await axios.post('/api/brands', formData);
      }
      onSave();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving brand');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {brand ? 'Edit Brand' : 'Create New Brand'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Brand Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
          />

          <FormControl>
            <InputLabel>Publication Frequency</InputLabel>
            <Select
              value={formData.frequency}
              label="Publication Frequency"
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="biannual">Bi-Annual</MenuItem>
              <MenuItem value="annual">Annual</MenuItem>
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!formData.name}
        >
          {brand ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BrandDialog; 