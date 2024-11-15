import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondary,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tooltip
} from '@mui/material';
import {
  PersonAdd as AssignIcon,
  SwapHoriz as ReassignIcon,
  History as HistoryIcon,
  CheckCircle as CompletedIcon,
  Warning as OverdueIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const TaskAssignment = ({ task, onAssignmentUpdate }) => {
  const { user } = useAuth();
  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamMembers();
    fetchAssignmentHistory();
  }, [task]);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`/api/users/department/${task.department}`);
      setTeamMembers(response.data);
    } catch (error) {
      setError('Error fetching team members');
    }
  };

  const fetchAssignmentHistory = async () => {
    try {
      const response = await axios.get(`/api/tasks/${task._id}/assignments`);
      setAssignmentHistory(response.data);
    } catch (error) {
      setError('Error fetching assignment history');
    }
  };

  const handleAssignment = async () => {
    try {
      const response = await axios.post(`/api/tasks/${task._id}/assign`, {
        assignedTo: selectedMember,
        note: assignmentNote,
        assignedBy: user.id
      });

      onAssignmentUpdate(response.data);
      setAssignmentDialog(false);
      setSelectedMember('');
      setAssignmentNote('');
      fetchAssignmentHistory();
    } catch (error) {
      setError(error.response?.data?.message || 'Error assigning task');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon color="success" />;
      case 'overdue':
        return <OverdueIcon color="error" />;
      default:
        return <PendingIcon color="info" />;
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Current Assignment</Typography>
          {user.role.includes('manager') && (
            <Button
              startIcon={task.assignedTo ? <ReassignIcon /> : <AssignIcon />}
              variant="contained"
              onClick={() => setAssignmentDialog(true)}
            >
              {task.assignedTo ? 'Reassign' : 'Assign'}
            </Button>
          )}
        </Box>

        {task.assignedTo ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={task.assignedTo.avatar}>
              {task.assignedTo.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1">
                {task.assignedTo.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Assigned {new Date(task.assignedAt).toLocaleDateString()}
              </Typography>
            </Box>
            {getStatusIcon(task.status)}
          </Box>
        ) : (
          <Typography color="textSecondary">
            No one is assigned to this task
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Assignment History
        </Typography>
        <List>
          {assignmentHistory.map((assignment) => (
            <ListItem
              key={assignment._id}
              secondaryAction={
                <Chip
                  label={assignment.status}
                  size="small"
                  color={assignment.status === 'completed' ? 'success' : 'default'}
                />
              }
            >
              <ListItemAvatar>
                <Avatar src={assignment.assignedTo.avatar}>
                  {assignment.assignedTo.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={assignment.assignedTo.name}
                secondary={
                  <>
                    <Typography variant="caption" display="block">
                      {new Date(assignment.assignedAt).toLocaleDateString()} - 
                      {assignment.completedAt ? 
                        new Date(assignment.completedAt).toLocaleDateString() : 
                        'Current'}
                    </Typography>
                    {assignment.note && (
                      <Typography variant="body2" color="textSecondary">
                        Note: {assignment.note}
                      </Typography>
                    )}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog
        open={assignmentDialog}
        onClose={() => setAssignmentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {task.assignedTo ? 'Reassign Task' : 'Assign Task'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Team Member</InputLabel>
            <Select
              value={selectedMember}
              label="Team Member"
              onChange={(e) => setSelectedMember(e.target.value)}
            >
              {teamMembers.map((member) => (
                <MenuItem key={member._id} value={member._id}>
                  {member.name} - {member.role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Assignment Note"
            value={assignmentNote}
            onChange={(e) => setAssignmentNote(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAssignment}
            disabled={!selectedMember}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskAssignment; 