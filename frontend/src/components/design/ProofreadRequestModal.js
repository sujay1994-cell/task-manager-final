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
  Checkbox,
  FormControlLabel
} from '@mui/material';

const ProofreadRequestModal = ({ open, onClose, onSubmit, task }) => {
  const [request, setRequest] = useState({
    type: 'design_proofread',
    priority: 'normal',
    message: '',
    needsSpellCheck: false,
    needsLayoutCheck: true,
    needsColorCheck: true
  });

  const handleSubmit = () => {
    onSubmit(request);
    setRequest({
      type: 'design_proofread',
      priority: 'normal',
      message: '',
      needsSpellCheck: false,
      needsLayoutCheck: true,
      needsColorCheck: true
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Request Proofread
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

          <FormControlLabel
            control={
              <Checkbox
                checked={request.needsSpellCheck}
                onChange={(e) => setRequest({ ...request, needsSpellCheck: e.target.checked })}
              />
            }
            label="Spell Check Required"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={request.needsLayoutCheck}
                onChange={(e) => setRequest({ ...request, needsLayoutCheck: e.target.checked })}
              />
            }
            label="Layout Check Required"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={request.needsColorCheck}
                onChange={(e) => setRequest({ ...request, needsColorCheck: e.target.checked })}
              />
            }
            label="Color Check Required"
          />

          <TextField
            label="Additional Notes"
            multiline
            rows={4}
            value={request.message}
            onChange={(e) => setRequest({ ...request, message: e.target.value })}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          Submit Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProofreadRequestModal; 