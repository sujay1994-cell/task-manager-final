import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Comment as CommentIcon,
  CheckCircle as CompleteIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import FileUpload from '../files/FileUpload';

const MyTasks = () => {
  const dispatch = useDispatch();
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [comment, setComment] = useState('');

  const tasks = useSelector(state => 
    state.tasks.items.filter(task => 
      task.assignedTo?._id === state.auth.user._id &&
      task.status !== 'completed'
    )
  );

  const handleUploadComplete = () => {
    setUploadDialogOpen(false);
    // Refresh task data
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      // Add comment logic
      setCommentDialogOpen(false);
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleMarkComplete = async (task) => {
    try {
      // Mark task complete logic
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const TaskCard = ({ task }) => (
    <Card className="mb-4">
      <CardContent>
        <Box className="flex justify-between items-start mb-3">
          <Typography variant="h6">{task.name}</Typography>
          <Chip
            label={task.status}
            color={task.status === 'awaiting-approval' ? 'warning' : 'primary'}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="textSecondary" gutterBottom>
          Deadline: {new Date(task.deadline).toLocaleDateString()}
        </Typography>

        <Box className="flex justify-end space-x-2 mt-4">
          <IconButton
            size="small"
            onClick={() => {
              setSelectedTask(task);
              setUploadDialogOpen(true);
            }}
            title="Upload Files"
          >
            <UploadIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedTask(task);
              setCommentDialogOpen(true);
            }}
            title="Add Comment"
          >
            <CommentIcon />
          </IconButton>
          {task.status === 'in-progress' && (
            <IconButton
              size="small"
              onClick={() => handleMarkComplete(task)}
              title="Mark Complete"
              color="success"
            >
              <CompleteIcon />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {tasks.length === 0 ? (
        <Typography color="textSecondary" align="center">
          No active tasks assigned to you
        </Typography>
      ) : (
        tasks.map(task => (
          <TaskCard key={task._id} task={task} />
        ))
      )}

      {/* File Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload Files</DialogTitle>
        <DialogContent>
          <FileUpload
            taskId={selectedTask?._id}
            onUploadComplete={handleUploadComplete}
          />
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
      >
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            label="Comment"
            fullWidth
            variant="outlined"
            className="mt-2"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddComment}
            variant="contained"
            color="primary"
            disabled={!comment.trim()}
          >
            Add Comment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyTasks; 