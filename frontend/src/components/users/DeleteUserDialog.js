import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const DeleteUserDialog = ({ open, onClose, onConfirm, user }) => {
  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: 'error.main' }}>Delete User</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WarningIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h6">
            Are you sure you want to delete this user?
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ mr: 2 }}>{user.name[0]}</Avatar>
          <Box>
            <Typography variant="subtitle1">{user.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {user.email}
            </Typography>
          </Box>
        </Box>
        <Typography color="error">
          This action cannot be undone. All data associated with this user will be permanently deleted.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="error"
        >
          Delete User
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUserDialog; 