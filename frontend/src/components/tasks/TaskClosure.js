import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';

const TaskClosure = ({ task, onClose, onReopen }) => {
  const [openCloseDialog, setOpenCloseDialog] = useState(false);
  const [openReopenDialog, setOpenReopenDialog] = useState(false);
  const [clientApproval, setClientApproval] = useState({
    approved: false,
    approvedBy: '',
    comments: ''
  });
  const [reopenReason, setReopenReason] = useState('');

  const handleClose = async () => {
    try {
      const response = await fetch(`/api/tasks/${task._id}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientApproval })
      });

      if (!response.ok) {
        throw new Error('Failed to close task');
      }

      setOpenCloseDialog(false);
      onClose();
    } catch (error) {
      console.error('Error closing task:', error);
    }
  };

  const handleReopen = async () => {
    try {
      const response = await fetch(`/api/tasks/${task._id}/reopen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: reopenReason })
      });

      if (!response.ok) {
        throw new Error('Failed to reopen task');
      }

      setOpenReopenDialog(false);
      onReopen();
    } catch (error) {
      console.error('Error reopening task:', error);
    }
  };

  return (
    <Box>
      {/* Close Task Button */}
      {!task.closure?.isClosed && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenCloseDialog(true)}
        >
          Close Task
        </Button>
      )}

      {/* Reopen Task Button */}
      {task.closure?.isClosed && (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setOpenReopenDialog(true)}
        >
          Reopen Task
        </Button>
      )}

      {/* Close Task Dialog */}
      <Dialog
        open={openCloseDialog}
        onClose={() => setOpenCloseDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Close Task</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={clientApproval.approved}
                  onChange={(e) => setClientApproval({
                    ...clientApproval,
                    approved: e.target.checked
                  })}
                />
              }
              label="Client Approval Received"
            />
            
            <TextField
              label="Approved By"
              value={clientApproval.approvedBy}
              onChange={(e) => setClientApproval({
                ...clientApproval,
                approvedBy: e.target.value
              })}
              fullWidth
            />

            <TextField
              label="Comments"
              value={clientApproval.comments}
              onChange={(e) => setClientApproval({
                ...clientApproval,
                comments: e.target.value
              })}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCloseDialog(false)}>Cancel</Button>
          <Button onClick={handleClose} variant="contained" color="primary">
            Close Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reopen Task Dialog */}
      <Dialog
        open={openReopenDialog}
        onClose={() => setOpenReopenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reopen Task</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Reason for Reopening"
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              multiline
              rows={4}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReopenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleReopen}
            variant="contained"
            color="secondary"
            disabled={!reopenReason.trim()}
          >
            Reopen Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Closure History */}
      {task.closure?.reopenHistory?.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Reopen History
          </Typography>
          <List>
            {task.closure.reopenHistory.map((entry, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={`Reopened by ${entry.reopenedBy.name}`}
                    secondary={`
                      ${new Date(entry.reopenedAt).toLocaleString()}
                      Reason: ${entry.reason}
                    `}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default TaskClosure; 