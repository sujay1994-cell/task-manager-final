import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Launch as LaunchIcon,
  Print as PrintIcon,
  Twitter as TwitterIcon,
  CheckCircle as ApproveIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';

const LaunchWorkflow = ({ edition, onComplete }) => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [launchDate, setLaunchDate] = useState(null);
  const [notes, setNotes] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [automationStatus, setAutomationStatus] = useState(null);

  useEffect(() => {
    if (edition) {
      fetchAutomationStatus();
    }
  }, [edition]);

  const fetchAutomationStatus = async () => {
    try {
      const response = await axios.get(`/api/automation/editions/${edition._id}/automation-status`);
      setAutomationStatus(response.data);
    } catch (error) {
      console.error('Error fetching automation status:', error);
    }
  };

  const steps = [
    {
      label: 'Launch Request',
      description: 'Request magazine launch after all tasks are completed',
      action: requestLaunch,
      canProceed: () => user.role === 'sales_manager' && launchDate && notes.trim()
    },
    {
      label: 'Prepare Reprints',
      description: 'Design team prepares reprints (automatically assigned)',
      action: checkReprintsStatus,
      canProceed: () => automationStatus?.reprintsPrepared
    },
    {
      label: 'Marketing Materials',
      description: 'Prepare Twitter marketing materials',
      action: checkMarketingStatus,
      canProceed: () => automationStatus?.marketingPrepared
    },
    {
      label: 'Print Approval',
      description: 'Sales and Editorial managers approve print',
      action: requestPrintApproval,
      canProceed: () => automationStatus?.printApproved
    },
    {
      label: 'Generate Print',
      description: 'Design team generates final print',
      action: checkPrintStatus,
      canProceed: () => automationStatus?.printGenerated
    }
  ];

  async function requestLaunch() {
    setLoading(true);
    setError('');
    try {
      await axios.post(`/api/launch/editions/${edition._id}/launch`, {
        launchDate,
        notes
      });
      await fetchAutomationStatus();
      setActiveStep(1);
    } catch (error) {
      setError(error.response?.data?.message || 'Error requesting launch');
    } finally {
      setLoading(false);
    }
  }

  async function checkReprintsStatus() {
    setActiveStep(2);
  }

  async function checkMarketingStatus() {
    setActiveStep(3);
  }

  async function requestPrintApproval() {
    setConfirmDialog(true);
  }

  async function handlePrintApproval() {
    setLoading(true);
    setError('');
    try {
      await axios.post(`/api/launch/editions/${edition._id}/print-approval`);
      await fetchAutomationStatus();
      setConfirmDialog(false);
      setActiveStep(4);
    } catch (error) {
      setError(error.response?.data?.message || 'Error approving print');
    } finally {
      setLoading(false);
    }
  }

  async function checkPrintStatus() {
    if (automationStatus?.printGenerated) {
      onComplete();
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom color="primary">
        Launch Workflow
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              StepIconComponent={() => (
                <Box sx={{ 
                  color: index === activeStep ? 'primary.main' : 'grey.400',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {index === 0 ? <LaunchIcon /> :
                   index === 1 ? <PrintIcon /> :
                   index === 2 ? <TwitterIcon /> :
                   index === 3 ? <ApproveIcon /> :
                   <PrintIcon />}
                </Box>
              )}
            >
              {step.label}
            </StepLabel>
            <StepContent>
              <Typography color="textSecondary" paragraph>
                {step.description}
              </Typography>

              {index === 0 && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <DatePicker
                    label="Launch Date"
                    value={launchDate}
                    onChange={setLaunchDate}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth sx={{ mb: 2 }} />
                    )}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Launch Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Box>
              )}

              {automationStatus?.status === 'error' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Automation error: {automationStatus.error}
                </Alert>
              )}

              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={step.action}
                  disabled={loading || !step.canProceed()}
                  sx={{ mr: 1 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Continue'}
                </Button>
                {index > 0 && (
                  <Button
                    onClick={() => setActiveStep(index - 1)}
                    disabled={loading}
                  >
                    Back
                  </Button>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
      >
        <DialogTitle>Confirm Print Approval</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to approve the print? This will trigger the final print generation.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handlePrintApproval}
            disabled={loading}
          >
            Approve Print
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default LaunchWorkflow; 