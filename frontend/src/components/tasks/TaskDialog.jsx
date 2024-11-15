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
  Grid,
  Box,
  Chip,
  Typography,
  IconButton,
  Alert
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { checkPermission } from '../../utils/permissions';
import axios from 'axios';

const TaskDialog = ({ open, task, onClose, onSave }) => {
  const { user } = useAuth();
  const [brands, setBrands] = useState([]);
  const [editions, setEditions] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    brand: '',
    edition: '',
    title: '',
    type: '',
    description: '',
    department: user.department,
    assignedTo: '',
    priority: 'medium',
    deadline: '',
    status: 'pending'
  });

  const permissions = {
    canAssignTasks: checkPermission(user, 'canAssignTasks'),
    canSetPriority: checkPermission(user, 'canSetPriority'),
    canSetDeadline: checkPermission(user, 'canSetDeadline'),
    canUploadFiles: checkPermission(user, 'canUploadFiles')
  };

  useEffect(() => {
    if (open) {
      fetchBrands();
      fetchTeamMembers();
      if (task) {
        initializeFormData(task);
      }
    }
  }, [open, task]);

  useEffect(() => {
    if (formData.brand) {
      fetchEditions(formData.brand);
    }
  }, [formData.brand]);

  const fetchBrands = async () => {
    try {
      const response = await axios.get('/api/brands');
      setBrands(response.data);
    } catch (error) {
      setError('Error fetching brands');
    }
  };

  const fetchEditions = async (brandId) => {
    try {
      const response = await axios.get(`/api/brands/${brandId}/editions`);
      setEditions(response.data);
    } catch (error) {
      setError('Error fetching editions');
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`/api/users/department/${user.department}`);
      setTeamMembers(response.data);
    } catch (error) {
      setError('Error fetching team members');
    }
  };

  const handleFileChange = (event) => {
    if (!permissions.canUploadFiles) {
      setError('You do not have permission to upload files');
      return;
    }
    const newFiles = Array.from(event.target.files);
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      files.forEach(file => {
        formDataToSend.append('files', file);
      });

      if (task) {
        await axios.put(`/api/tasks/${task._id}`, formDataToSend);
      } else {
        await axios.post('/api/tasks', formDataToSend);
      }

      onSave();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving task');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {task ? 'Edit Task' : 'Create New Task'}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Brand</InputLabel>
              <Select
                value={formData.brand}
                label="Brand"
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                disabled={!permissions.canAssignTasks}
              >
                {brands.map(brand => (
                  <MenuItem key={brand._id} value={brand._id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Edition</InputLabel>
              <Select
                value={formData.edition}
                label="Edition"
                onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                disabled={!formData.brand || !permissions.canAssignTasks}
              >
                {editions.map(edition => (
                  <MenuItem key={edition._id} value={edition._id}>
                    {edition.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Continue with other form fields... */}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.title || !formData.brand || !formData.edition}
        >
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDialog; 