import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Divider,
  Alert
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { updateUserRole } from '../../features/users/usersSlice';
import { ROLE_PERMISSIONS } from '../../config/permissions';

const UserRoles = ({ user, onUserSelect }) => {
  const dispatch = useDispatch();
  const [selectedRole, setSelectedRole] = useState(user?.role || '');
  const [error, setError] = useState('');

  if (!user) {
    return (
      <Box className="text-center py-8">
        <Typography color="textSecondary">
          Select a user to manage their roles and permissions
        </Typography>
      </Box>
    );
  }

  const handleRoleChange = async () => {
    try {
      await dispatch(updateUserRole({
        userId: user._id,
        role: selectedRole
      }));
      setError('');
    } catch (error) {
      setError('Error updating user role');
    }
  };

  const renderPermissionsList = (permissions) => {
    return Object.entries(permissions).map(([category, perms]) => (
      <Box key={category} className="mb-4">
        <Typography variant="subtitle2" color="primary" gutterBottom>
          {category.toUpperCase()}
        </Typography>
        <List dense>
          {perms.map((permission) => (
            <ListItem key={permission}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={true}
                  disabled
                  tabIndex={-1}
                />
              </ListItemIcon>
              <ListItemText primary={permission.replace(/_/g, ' ')} />
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    ));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Role Assignment
            </Typography>
            <Box className="space-y-4">
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  label="Role"
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

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleRoleChange}
                fullWidth
              >
                Update Role
              </Button>

              {error && (
                <Alert severity="error" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Role Permissions
            </Typography>
            {selectedRole && ROLE_PERMISSIONS[selectedRole] ? (
              renderPermissionsList(ROLE_PERMISSIONS[selectedRole])
            ) : (
              <Typography color="textSecondary">
                Select a role to view permissions
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default UserRoles; 