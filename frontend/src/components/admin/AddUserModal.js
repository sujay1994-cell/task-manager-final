import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Typography
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { createUser } from '../../features/users/usersSlice';

const AddUserModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate department based on role
      if (formData.role.includes('_member') || 
          (formData.role.includes('_manager') && !formData.role.includes('super'))) {
        if (!formData.department) {
          setError('Department is required for this role');
          return;
        }
      }

      await dispatch(createUser(formData));
      onClose();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role,
      // Clear department if super admin or super manager
      department: role === 'super_admin' || role === 'super_manager' ? '' : prev.department
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 mt-2">
            <TextField
              fullWidth
              required
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <TextField
              fullWidth
              required
              type="email"
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <TextField
              fullWidth
              required
              type="password"
              label="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value)}
              >
                <MenuItem value="super_admin">Super Admin</MenuItem>
                <MenuItem value="super_manager">Super Manager</MenuItem>
                <MenuItem value="sales_manager">Sales Manager</MenuItem>
                <MenuItem value="editorial_manager">Editorial Manager</MenuItem>
                <MenuItem value="design_manager">Design Manager</MenuItem>
                <MenuItem value="sales_member">Sales Member</MenuItem>
                <MenuItem value="editorial_member">Editorial Member</MenuItem>
                <MenuItem value="design_member">Design Member</MenuItem>
              </Select>
            </FormControl>

            {formData.role && !['super_admin', 'super_manager'].includes(formData.role) && (
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <MenuItem value="Sales">Sales</MenuItem>
                  <MenuItem value="Editorial">Editorial</MenuItem>
                  <MenuItem value="Design">Design</MenuItem>
                </Select>
              </FormControl>
            )}

            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!formData.name || !formData.email || !formData.password || !formData.role}
          >
            Add User
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddUserModal; 