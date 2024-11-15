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
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox
} from '@mui/material';

const ApprovalRequestModal = ({ open, onClose, onSubmit, task }) => {
  const [request, setRequest] = useState({
    type: 'design_approval',
    priority: 'normal',
    message: '',
    approvers: [],
    files: []
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  const handleSubmit = () => {
    onSubmit({
      ...request,
      files: selectedFiles
    });
    setRequest({
      type: 'design_approval',
      priority: 'normal',
      message: '',
      approvers: [],
      files: []
    });
    setSelectedFiles([]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Request Approval
        {task && (
          <Typography variant="subtitle2" color="textSecondary">
            Task: {task.name}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={request.priority}
              onChange={(e) => setRequest({ ...request, priority: e.target.value })}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="subtitle1">Select Files for Approval</Typography>
          <List>
            {task?.designs?.map((file) => (
              <ListItem
                key={file._id}
                button
                onClick={() => handleFileSelect(file._id)}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedFiles.includes(file._id)}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={new Date(file.uploadedAt).toLocaleString()}
                />
              </ListItem>
            ))}
          </List>

          <TextField
            label="Comments"
            multiline
            rows={4}
            value={request.message}
            onChange={(e) => setRequest({ ...request, message: e.target.value })}
            fullWidth
            placeholder="Add any specific instructions or notes for the approvers..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={selectedFiles.length === 0}
        >
          Submit for Approval
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalRequestModal; 