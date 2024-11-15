import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { approvePrint } from '../../features/editions/editionsSlice';

const PrintApprovalDialog = ({ open, onClose, edition }) => {
  const dispatch = useDispatch();

  const handleApproval = async (approved) => {
    try {
      await dispatch(approvePrint({
        editionId: edition._id,
        approved
      }));
      onClose();
    } catch (error) {
      console.error('Error handling print approval:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Print Approval Required</DialogTitle>
      <DialogContent>
        <Typography>
          All tasks of {edition?.brand?.name} &gt; {edition?.name} are completed.
          Can it go for print?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleApproval(false)} color="error">
          Reject
        </Button>
        <Button onClick={() => handleApproval(true)} color="success" variant="contained">
          Approve for Print
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrintApprovalDialog; 