import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import FileUpload from '../files/FileUpload';

const CreateTaskForm = ({ brands, editions, users, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    edition: '',
    type: '',
    assignedTo: '',
    deadline: null,
    files: []
  });

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      description: '',
      brand: '',
      edition: '',
      type: '',
      assignedTo: '',
      deadline: null,
      files: []
    });
  };

  const handleFileUpload = (files) => {
    setFormData({
      ...formData,
      files: [...formData.files, ...files]
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Task Name"
            value={formData.name}
            onChange={handleChange('name')}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={formData.description}
            onChange={handleChange('description')}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Brand</InputLabel>
            <Select
              value={formData.brand}
              onChange={handleChange('brand')}
              required
            >
              {brands.map(brand => (
                <MenuItem key={brand._id} value={brand._id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Edition</InputLabel>
            <Select
              value={formData.edition}
              onChange={handleChange('edition')}
              required
            >
              {editions
                .filter(edition => !formData.brand || edition.brand === formData.brand)
                .map(edition => (
                  <MenuItem key={edition._id} value={edition._id}>
                    {edition.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Task Type</InputLabel>
            <Select
              value={formData.type}
              onChange={handleChange('type')}
              required
            >
              <MenuItem value="content">Content</MenuItem>
              <MenuItem value="design">Design</MenuItem>
              <MenuItem value="review">Review</MenuItem>
              <MenuItem value="approval">Approval</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Assign To</InputLabel>
            <Select
              value={formData.assignedTo}
              onChange={handleChange('assignedTo')}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {users.map(user => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <DatePicker
            label="Deadline"
            value={formData.deadline}
            onChange={(newValue) => {
              setFormData({
                ...formData,
                deadline: newValue
              });
            }}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </Grid>
        <Grid item xs={12}>
          <FileUpload onUpload={handleFileUpload} />
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            Create Task
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default CreateTaskForm; 