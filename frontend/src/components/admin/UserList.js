import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, deleteUser } from '../../features/users/usersSlice';

const UserList = ({ onUserSelect, selectedUser }) => {
  const dispatch = useDispatch();
  const users = useSelector(state => state.users.items);
  const [filters, setFilters] = useState({
    department: 'all',
    role: 'all',
    search: ''
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteUser(userToDelete._id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      await dispatch(updateUser({
        id: user._id,
        active: !user.active
      }));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    if (filters.department !== 'all' && user.department !== filters.department) {
      return false;
    }
    if (filters.role !== 'all' && user.role !== filters.role) {
      return false;
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return user.name.toLowerCase().includes(searchTerm) ||
             user.email.toLowerCase().includes(searchTerm);
    }
    return true;
  });

  return (
    <Box>
      {/* Filters */}
      <Box className="mb-4 flex gap-4">
        <FormControl variant="outlined" size="small" className="min-w-[200px]">
          <InputLabel>Department</InputLabel>
          <Select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            label="Department"
          >
            <MenuItem value="all">All Departments</MenuItem>
            <MenuItem value="Sales">Sales</MenuItem>
            <MenuItem value="Editorial">Editorial</MenuItem>
            <MenuItem value="Design">Design</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small" className="min-w-[200px]">
          <InputLabel>Role</InputLabel>
          <Select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            label="Role"
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="super_admin">Super Admin</MenuItem>
            <MenuItem value="super_manager">Super Manager</MenuItem>
            <MenuItem value="sales_manager">Sales Manager</MenuItem>
            <MenuItem value="editorial_manager">Editorial Manager</MenuItem>
            <MenuItem value="design_manager">Design Manager</MenuItem>
            <MenuItem value="team_member">Team Member</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Search users..."
          variant="outlined"
          className="flex-grow"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </Box>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow 
                key={user._id}
                selected={selectedUser?._id === user._id}
                onClick={() => onUserSelect(user)}
                hover
              >
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.department}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.role.replace('_', ' ').toUpperCase()}
                    size="small"
                    color={user.role.includes('manager') ? 'secondary' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.active ? 'Active' : 'Inactive'}
                    size="small"
                    color={user.active ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUserSelect(user);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusToggle(user);
                    }}
                  >
                    <BlockIcon color={user.active ? 'error' : 'success'} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(user);
                    }}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete User</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {userToDelete?.name}? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserList; 