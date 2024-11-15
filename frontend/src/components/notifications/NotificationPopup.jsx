import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  CheckCircle as ApproveIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const NotificationPopup = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [notification, setNotification] = useState(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalData, setApprovalData] = useState(null);

  useEffect(() => {
    if (!socket) return;

    // Listen for notifications
    socket.on('notification', handleNotification);
    socket.on('printApprovalRequired', handlePrintApproval);
    socket.on('taskOverdue', handleOverdueTask);
    socket.on('editionComplete', handleEditionComplete);
    socket.on('reprintTask', handleReprintTask);

    return () => {
      socket.off('notification');
      socket.off('printApprovalRequired');
      socket.off('taskOverdue');
      socket.off('editionComplete');
      socket.off('reprintTask');
    };
  }, [socket]);

  const handleNotification = (data) => {
    setNotification({
      message: data.message,
      type: data.type || 'info',
      duration: data.duration || 6000
    });
  };

  const handlePrintApproval = (data) => {
    if (['sales_manager', 'editorial_manager'].includes(user.role)) {
      setApprovalData(data);
      setShowApprovalDialog(true);
    }
  };

  const handleOverdueTask = (data) => {
    if (user.role.includes('manager') || data.assignedTo === user.id) {
      setNotification({
        message: `Task "${data.taskName}" is overdue`,
        type: 'warning',
        duration: 8000
      });
    }
  };

  const handleEditionComplete = (data) => {
    if (user.role === 'sales_manager') {
      setNotification({
        message: `All tasks completed for edition: ${data.editionName}. Ready for launch!`,
        type: 'success',
        duration: 8000
      });
    }
  };

  const handleReprintTask = (data) => {
    if (user.department === 'design') {
      setNotification({
        message: `New reprint task created for ${data.editionName}`,
        type: 'info',
        duration: 6000
      });
    }
  };

  const handleApprove = async () => {
    try {
      await axios.post(`/api/editions/${approvalData.editionId}/approve-print`);
      setNotification({
        message: 'Print approved successfully',
        type: 'success',
        duration: 4000
      });
    } catch (error) {
      setNotification({
        message: 'Error approving print',
        type: 'error',
        duration: 4000
      });
    } finally {
      setShowApprovalDialog(false);
      setApprovalData(null);
    }
  };

  const handleReject = async () => {
    try {
      await axios.post(`/api/editions/${approvalData.editionId}/reject-print`, {
        reason: 'Changes required' // You could add a text field for this
      });
      setNotification({
        message: 'Print rejected',
        type: 'info',
        duration: 4000
      });
    } catch (error) {
      setNotification({
        message: 'Error rejecting print',
        type: 'error',
        duration: 4000
      });
    } finally {
      setShowApprovalDialog(false);
      setApprovalData(null);
    }
  };

  return (
    <>
      {/* Regular notifications */}
      <Snackbar
        open={!!notification}
        autoHideDuration={notification?.duration}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {notification && (
          <Alert
            severity={notification.type}
            onClose={() => setNotification(null)}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>

      {/* Print Approval Dialog */}
      <Dialog
        open={showApprovalDialog}
        onClose={() => setShowApprovalDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PrintIcon color="primary" />
            <Typography>Print Approval Required</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {approvalData?.editionName} is ready for print approval.
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Please review and approve the final print version.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<CloseIcon />}
            onClick={handleReject}
            color="error"
          >
            Reject
          </Button>
          <Button
            startIcon={<ApproveIcon />}
            onClick={handleApprove}
            color="success"
            variant="contained"
          >
            Approve Print
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NotificationPopup; 