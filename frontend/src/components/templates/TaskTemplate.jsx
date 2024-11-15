import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CloneIcon,
  Save as SaveIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const TaskTemplate = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    department: user.department,
    checklistItems: [],
    defaultAssignees: [],
    estimatedDuration: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/templates', {
        params: { department: user.department }
      });
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedTemplate) {
        await axios.put(`/api/templates/${selectedTemplate._id}`, formData);
      } else {
        await axios.post('/api/templates', formData);
      }
      fetchTemplates();
      handleClose();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedTemplate(null);
    setFormData({
      name: '',
      type: '',
      description: '',
      department: user.department,
      checklistItems: [],
      defaultAssignees: [],
      estimatedDuration: '',
      priority: 'medium'
    });
  };

  const handleClone = async (template) => {
    try {
      const { _id, ...templateData } = template;
      templateData.name = `${templateData.name} (Copy)`;
      await axios.post('/api/templates', templateData);
      fetchTemplates();
    } catch (error) {
      console.error('Error cloning template:', error);
    }
  };

  const handleDelete = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await axios.delete(`/api/templates/${templateId}`);
        fetchTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const addChecklistItem = () => {
    setFormData({
      ...formData,
      checklistItems: [...formData.checklistItems, '']
    });
  };

  const updateChecklistItem = (index, value) => {
    const newItems = [...formData.checklistItems];
    newItems[index] = value;
    setFormData({
      ...formData,
      checklistItems: newItems
    });
  };

  const removeChecklistItem = (index) => {
    setFormData({
      ...formData,
      checklistItems: formData.checklistItems.filter((_, i) => i !== index)
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Task Templates</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Create Template
        </Button>
      </Box>

      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template._id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{template.name}</Typography>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => handleClone(template)}
                    title="Clone Template"
                  >
                    <CloneIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setFormData(template);
                      setDialogOpen(true);
                    }}
                    title="Edit Template"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(template._id)}
                    title="Delete Template"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              <Chip label={template.type} size="small" sx={{ mb: 2 }} />
              
              <Typography variant="body2" color="textSecondary" paragraph>
                {template.description}
              </Typography>

              {template.checklistItems.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Checklist Items:
                  </Typography>
                  <List dense>
                    {template.checklistItems.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTemplate ? 'Edit Template' : 'Create Template'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="Profile">Profile</MenuItem>
                  <MenuItem value="Cover">Cover</MenuItem>
                  <MenuItem value="Intro">Intro</MenuItem>
                  <MenuItem value="Editorial">Editorial</MenuItem>
                  <MenuItem value="Ads">Ads</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Checklist Items
              </Typography>
              {formData.checklistItems.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={item}
                    onChange={(e) => updateChecklistItem(index, e.target.value)}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeChecklistItem(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={addChecklistItem}
                sx={{ mt: 1 }}
              >
                Add Checklist Item
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={<SaveIcon />}
          >
            {selectedTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskTemplate; 