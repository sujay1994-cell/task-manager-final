import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  AssignmentReturn as ReassignIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const EditorialTaskManagement = () => {
  const [filter, setFilter] = useState({
    status: 'all',
    assignee: 'all',
    priority: 'all'
  });
  const [reviewDialog, setReviewDialog] = useState({
    open: false,
    task: null,
    action: null
  });

  const tasks = useSelector(state => 
    state.tasks.items.filter(task => task.department === 'Editorial')
  );

  const teamMembers = useSelector(state =>
    state.users.items.filter(user => user.department === 'Editorial')
  );

  const handleReview = (task, action) => {
    setReviewDialog({
      open: true,
      task,
      action
    });
  };

  const handleReviewSubmit = async (feedback) => {
    // Handle review submission logic
    setReviewDialog({ open: false, task: null, action: null });
  };

  return (
    <Box>
      {/* Filters */}
      <Box className="mb-4 flex gap-4">
        <FormControl variant="outlined" size="small" className="min-w-[200px]">
          <InputLabel>Status</InputLabel>
          <Select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            label="Status"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="pending-review">Pending Review</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="needs-revision">Needs Revision</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small" className="min-w-[200px]">
          <InputLabel>Assignee</InputLabel>
          <Select
            value={filter.assignee}
            onChange={(e) => setFilter({ ...filter, assignee: e.target.value })}
            label="Assignee"
          >
            <MenuItem value="all">All Team Members</MenuItem>
            {teamMembers.map(member => (
              <MenuItem key={member._id} value={member._id}>
                {member.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Search tasks..."
          variant="outlined"
          className="flex-grow"
        />
      </Box>

      {/* Tasks Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task Name</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>{task.name}</TableCell>
                <TableCell>
                  <Chip
                    label={task.assignedTo?.name || 'Unassigned'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.status}
                    color={task.status === 'approved' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(task.deadline).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleReview(task, 'approve')}
                    title="Approve"
                  >
                    <ApproveIcon color="success" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleReview(task, 'revise')}
                    title="Request Revision"
                  >
                    <RejectIcon color="error" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleReview(task, 'reassign')}
                    title="Reassign"
                  >
                    <ReassignIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog.open}
        onClose={() => setReviewDialog({ open: false, task: null, action: null })}
      >
        <DialogTitle>
          {reviewDialog.action === 'approve' ? 'Approve Task' :
           reviewDialog.action === 'revise' ? 'Request Revision' :
           'Reassign Task'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Feedback"
            variant="outlined"
            className="mt-4"
          />
          {reviewDialog.action === 'reassign' && (
            <FormControl fullWidth className="mt-4">
              <InputLabel>Reassign To</InputLabel>
              <Select label="Reassign To">
                {teamMembers.map(member => (
                  <MenuItem key={member._id} value={member._id}>
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog({ open: false, task: null, action: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={reviewDialog.action === 'approve' ? 'success' : 'primary'}
            onClick={() => handleReviewSubmit()}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditorialTaskManagement; 