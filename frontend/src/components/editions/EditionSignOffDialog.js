import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { signOffEdition } from '../../features/editions/editionsSlice';

const EditionSignOffDialog = ({ open, onClose, edition, printTask }) => {
  const dispatch = useDispatch();
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignOff = async () => {
    try {
      setLoading(true);
      await dispatch(signOffEdition({
        editionId: edition._id,
        printTaskId: printTask._id,
        comments
      }));
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Sign Off Edition</DialogTitle>
      <DialogContent>
        <Box className="space-y-4">
          <Typography>
            You are about to sign off on the print generation for:
            <br />
            <strong>{edition?.brand?.name} &gt; {edition?.name}</strong>
          </Typography>

          <Alert severity="info">
            This action will mark the edition as completed and archive it.
            All tasks will be marked as completed.
          </Alert>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Sign-off Comments (Optional)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add any final comments or notes..."
          />

          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSignOff}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Sign Off & Complete Edition
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditionSignOffDialog; 