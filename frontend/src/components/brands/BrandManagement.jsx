import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
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
  Book as BookIcon,
  CalendarToday as CalendarIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';
import BrandDialog from './BrandDialog';
import EditionList from '../editions/EditionList';
import { useAuth } from '../../contexts/AuthContext';
import { checkPermission } from '../../utils/permissions';
import axios from 'axios';

const BrandManagement = () => {
  const { user } = useAuth();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showEditions, setShowEditions] = useState(null);

  const canCreateBrand = checkPermission(user, 'canManageBrands');
  const canDeleteBrand = checkPermission(user, 'canDeleteBrands');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get('/api/brands');
      setBrands(response.data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBrand = () => {
    setSelectedBrand(null);
    setDialogOpen(true);
  };

  const handleEditBrand = (brand) => {
    setSelectedBrand(brand);
    setDialogOpen(true);
  };

  const handleDeleteBrand = async (brandId) => {
    if (window.confirm('Are you sure you want to delete this brand? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/brands/${brandId}`);
        await fetchBrands();
      } catch (error) {
        console.error('Error deleting brand:', error);
      }
    }
  };

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case 'monthly':
        return 'primary';
      case 'quarterly':
        return 'secondary';
      case 'biannual':
        return 'warning';
      case 'annual':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" color="primary">
          Brand Management
        </Typography>
        {canCreateBrand && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateBrand}
          >
            Create Brand
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {brands.map((brand) => (
          <Grid item xs={12} sm={6} md={4} key={brand._id}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BookIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {brand.name}
                  </Typography>
                </Box>

                <Typography color="textSecondary" paragraph>
                  {brand.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    icon={<CalendarIcon />}
                    label={`${brand.frequency} publication`}
                    color={getFrequencyColor(brand.frequency)}
                    size="small"
                  />
                  <Chip
                    icon={<TaskIcon />}
                    label={`${brand.editionCount || 0} editions`}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                {brand.status === 'inactive' && (
                  <Chip
                    label="Inactive"
                    color="error"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button
                  size="small"
                  onClick={() => setShowEditions(brand._id)}
                >
                  View Editions
                </Button>
                {canCreateBrand && (
                  <Tooltip title="Edit Brand">
                    <IconButton
                      size="small"
                      onClick={() => handleEditBrand(brand)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {canDeleteBrand && (
                  <Tooltip title="Delete Brand">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteBrand(brand._id)}
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

      <BrandDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        brand={selectedBrand}
        onSave={fetchBrands}
      />

      <EditionList
        brandId={showEditions}
        open={Boolean(showEditions)}
        onClose={() => setShowEditions(null)}
      />
    </Box>
  );
};

export default BrandManagement; 