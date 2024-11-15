import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as TaskIcon,
  CalendarToday as DateIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import EditionDialog from './EditionDialog';
import { useAuth } from '../../contexts/AuthContext';
import { checkPermission } from '../../utils/permissions';
import axios from 'axios';

const EditionList = ({ brandId, open, onClose }) => {
  const { user } = useAuth();
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEdition, setSelectedEdition] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [brand, setBrand] = useState(null);

  const canCreateEdition = checkPermission(user, 'canManageEditions');
  const canDeleteEdition = checkPermission(user, 'canDeleteEditions');

  useEffect(() => {
    if (brandId && open) {
      fetchBrandDetails();
      fetchEditions();
    }
  }, [brandId, open]);

  const fetchBrandDetails = async () => {
    try {
      const response = await axios.get(`/api/brands/${brandId}`);
      setBrand(response.data);
    } catch (error) {
      console.error('Error fetching brand details:', error);
    }
  };

  const fetchEditions = async () => {
    try {
      const response = await axios.get(`/api/brands/${brandId}/editions`);
      setEditions(response.data);
    } catch (error) {
      console.error('Error fetching editions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEdition = () => {
    setSelectedEdition(null);
    setDialogOpen(true);
  };

  const handleEditEdition = (edition) => {
    setSelectedEdition(edition);
    setDialogOpen(true);
  };

  const handleDeleteEdition = async (editionId) => {
    if (window.confirm('Are you sure you want to delete this edition? All associated tasks will be deleted.')) {
      try {
        await axios.delete(`/api/editions/${editionId}`);
        await fetchEditions();
      } catch (error) {
        console.error('Error deleting edition:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning':
        return 'default';
      case 'in_progress':
        return 'primary';
      case 'review':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {brand?.name} - Editions
          </Typography>
          <Box>
            {canCreateEdition && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateEdition}
                sx={{ mr: 2 }}
              >
                Create Edition
              </Button>
            )}
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {editions.map((edition) => (
              <Grid item xs={12} sm={6} md={4} key={edition._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">
                        {edition.name}
                      </Typography>
                      <Chip
                        label={edition.status}
                        color={getStatusColor(edition.status)}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        icon={<DateIcon />}
                        label={`Release: ${new Date(edition.releaseDate).toLocaleDateString()}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<TaskIcon />}
                        label={`${edition.taskCount || 0} tasks`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Typography variant="body2" color="error">
                      Deadline: {new Date(edition.deadline).toLocaleDateString()}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      onClick={() => navigate(`/editions/${edition._id}/tasks`)}
                    >
                      View Tasks
                    </Button>
                    {canCreateEdition && (
                      <Tooltip title="Edit Edition">
                        <IconButton
                          size="small"
                          onClick={() => handleEditEdition(edition)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canDeleteEdition && (
                      <Tooltip title="Delete Edition">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteEdition(edition._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>

      <EditionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        edition={selectedEdition}
        brandId={brandId}
        onSave={fetchEditions}
      />
    </Dialog>
  );
};

export default EditionList; 