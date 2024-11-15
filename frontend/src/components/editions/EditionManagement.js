import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';

const EditionManagement = () => {
  const [editions, setEditions] = useState([]);
  const [brands, setBrands] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEdition, setSelectedEdition] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brandId: '',
    publishDate: '',
    deadline: ''
  });

  const handleCreate = () => {
    setSelectedEdition(null);
    setFormData({
      name: '',
      brandId: '',
      publishDate: '',
      deadline: ''
    });
    setOpenDialog(true);
  };

  const handleEdit = (edition) => {
    setSelectedEdition(edition);
    setFormData({
      name: edition.name,
      brandId: edition.brand._id,
      publishDate: edition.publishDate.split('T')[0],
      deadline: edition.deadline.split('T')[0]
    });
    setOpenDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return 'default';
      case 'in-progress': return 'primary';
      case 'review': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Edition Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add Edition
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Edition Name</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Publish Date</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Tasks</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {editions.map((edition) => (
              <TableRow key={edition._id}>
                <TableCell>{edition.name}</TableCell>
                <TableCell>{edition.brand.name}</TableCell>
                <TableCell>
                  <Chip
                    label={edition.status}
                    color={getStatusColor(edition.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(edition.publishDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(edition.deadline).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    startIcon={<TaskIcon />}
                    variant="outlined"
                  >
                    {edition.tasks?.length || 0} Tasks
                  </Button>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(edition)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEdition ? 'Edit Edition' : 'Create New Edition'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Edition Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Brand</InputLabel>
              <Select
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                label="Brand"
              >
                {brands.map((brand) => (
                  <MenuItem key={brand._id} value={brand._id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Publish Date"
              type="date"
              value={formData.publishDate}
              onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="Deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary">
            {selectedEdition ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditionManagement; 