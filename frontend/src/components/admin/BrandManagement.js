import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  createBrand, 
  updateBrand, 
  deleteBrand 
} from '../../features/brands/brandsSlice';

const BrandManagement = () => {
  const dispatch = useDispatch();
  const brands = useSelector(state => state.brands.items);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleCreate = () => {
    setSelectedBrand(null);
    setFormData({ name: '', description: '' });
    setDialogOpen(true);
  };

  const handleEdit = (brand) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description
    });
    setDialogOpen(true);
  };

  const handleDelete = async (brandId) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      await dispatch(deleteBrand(brandId));
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedBrand) {
        await dispatch(updateBrand({ id: selectedBrand._id, ...formData }));
      } else {
        await dispatch(createBrand(formData));
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving brand:', error);
    }
  };

  return (
    <>
      <Box className="mb-4 flex justify-end">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add Brand
        </Button>
      </Box>

      <Grid container spacing={3}>
        {brands.map((brand) => (
          <Grid item xs={12} md={6} lg={4} key={brand._id}>
            <Card>
              <CardContent>
                <Box className="flex justify-between items-start mb-2">
                  <Typography variant="h6">{brand.name}</Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleEdit(brand)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(brand._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography color="textSecondary" gutterBottom>
                  {brand.description}
                </Typography>

                <Box className="mt-4">
                  <Typography variant="subtitle2" gutterBottom>
                    Active Editions: {brand.activeEditionsCount}
                  </Typography>
                  <Chip
                    label={brand.active ? 'Active' : 'Inactive'}
                    color={brand.active ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {selectedBrand ? 'Edit Brand' : 'Create Brand'}
        </DialogTitle>
        <DialogContent>
          <Box className="space-y-4 mt-2">
            <TextField
              fullWidth
              label="Brand Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedBrand ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BrandManagement; 