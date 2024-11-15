import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import FileUpload from '../files/FileUpload';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const TaskCreationFlow = ({ onTaskCreated }) => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [brands, setBrands] = useState([]);
  const [editions, setEditions] = useState([]);
  const [editorialManagers, setEditorialManagers] = useState([]);
  const [files, setFiles] = useState([]);
  
  const [formData, setFormData] = useState({
    brandId: '',
    editionId: '',
    name: '',
    type: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    deadline: '',
    attachments: []
  });

  const taskTypes = ['Profile', 'Cover', 'Intro', 'Editorial', 'Ads', 'Others'];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.brandId) {
      fetchEditions(formData.brandId);
    }
  }, [formData.brandId]);

  const fetchInitialData = async () => {
    try {
      const [brandsRes, managersRes] = await Promise.all([
        axios.get('/api/brands'),
        axios.get('/api/users', { params: { role: 'editorial_manager' } })
      ]);
      setBrands(brandsRes.data);
      setEditorialManagers(managersRes.data);
    } catch (error) {
      setError('Error fetching initial data');
      console.error('Error:', error);
    }
  };

  const fetchEditions = async (brandId) => {
    try {
      const response = await axios.get(`/api/brands/${brandId}/editions`);
      setEditions(response.data);
    } catch (error) {
      setError('Error fetching editions');
      console.error('Error:', error);
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Create task
      const taskResponse = await axios.post('/api/tasks', {
        ...formData,
        createdBy: user.id,
        status: 'pending',
        taskId: `${formData.type.substring(0, 3).toUpperCase()}-${Date.now()}`
      });

      // Upload files if any
      if (files.length > 0) {
        const formDataFiles = new FormData();
        files.forEach(file => {
          formDataFiles.append('files', file);
        });
        
        await axios.post(`/api/tasks/${taskResponse.data._id}/files`, formDataFiles);
      }

      // Create initial history log
      await axios.post(`/api/tasks/${taskResponse.data._id}/history`, {
        action: 'TASK_CREATED',
        userId: user.id,
        details: 'Task created and assigned to Editorial Manager'
      });

      onTaskCreated(taskResponse.data);
      setActiveStep(0);
      setFormData({
        brandId: '',
        editionId: '',
        name: '',
        type: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        deadline: '',
        attachments: []
      });
      setFiles([]);
    } catch (error) {
      setError('Error creating task');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      label: 'Select Brand & Edition',
      content: (
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Brand</InputLabel>
            <Select
              value={formData.brandId}
              label="Brand"
              onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
            >
              {brands.map((brand) => (
                <MenuItem key={brand._id} value={brand._id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Edition</InputLabel>
            <Select
              value={formData.editionId}
              label="Edition"
              onChange={(e) => setFormData({ ...formData, editionId: e.target.value })}
              disabled={!formData.brandId}
            >
              {editions.map((edition) => (
                <MenuItem key={edition._id} value={edition._id}>
                  {edition.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )
    },
    {
      label: 'Task Details',
      content: (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Task Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Task Type</InputLabel>
            <Select
              value={formData.type}
              label="Task Type"
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {taskTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </Box>
      )
    },
    {
      label: 'Upload Files & Assign',
      content: (
        <Box sx={{ mt: 2 }}>
          <FileUpload
            files={files}
            onFilesChange={setFiles}
            maxFiles={5}
            acceptedTypes={['image/*', 'video/*', '.pdf', '.doc', '.docx']}
          />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Assign To</InputLabel>
            <Select
              value={formData.assignedTo}
              label="Assign To"
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            >
              {editorialManagers.map((manager) => (
                <MenuItem key={manager._id} value={manager._id}>
                  {manager.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )
    }
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Create New Task
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {steps[activeStep].content}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : activeStep === steps.length - 1 ? (
            'Create Task'
          ) : (
            'Next'
          )}
        </Button>
      </Box>
    </Paper>
  );
};

export default TaskCreationFlow; 