import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  Divider,
  Paper,
  IconButton
} from '@mui/material';
import {
  Send as SendIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { addComment, deleteComment } from '../../features/tasks/tasksSlice';

const TaskComments = ({ taskId, comments = [] }) => {
  const dispatch = useDispatch();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const currentUser = useSelector(state => state.auth.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await dispatch(addComment({
        taskId,
        comment: {
          text: newComment,
          replyTo: replyTo?.id
        }
      }));
      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await dispatch(deleteComment({ taskId, commentId }));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const getDepartmentColor = (department) => {
    switch (department?.toLowerCase()) {
      case 'sales':
        return '#4CAF50';
      case 'editorial':
        return '#2196F3';
      case 'design':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <Box className="space-y-4">
      {/* Comment Input */}
      <Paper className="p-4">
        <form onSubmit={handleSubmit}>
          {replyTo && (
            <Box className="mb-2 p-2 bg-gray-50 rounded flex justify-between items-center">
              <Typography variant="caption">
                Replying to {replyTo.user.name}'s comment
              </Typography>
              <IconButton size="small" onClick={() => setReplyTo(null)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            variant="outlined"
            className="mb-2"
          />
          <div className="flex justify-end">
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              type="submit"
              disabled={!newComment.trim()}
            >
              Post Comment
            </Button>
          </div>
        </form>
      </Paper>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <Paper key={comment._id} className="p-4">
            <div className="flex space-x-3">
              <Avatar
                style={{ backgroundColor: getDepartmentColor(comment.user.department) }}
              >
                {getInitials(comment.user.name)}
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <Typography variant="subtitle2">
                      {comment.user.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {comment.user.department} • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </Typography>
                  </div>
                  <div className="flex space-x-1">
                    <IconButton
                      size="small"
                      onClick={() => setReplyTo(comment)}
                      title="Reply"
                    >
                      <ReplyIcon fontSize="small" />
                    </IconButton>
                    {(currentUser._id === comment.user._id || currentUser.role === 'admin') && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(comment._id)}
                        title="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </div>
                </div>

                <Typography className="mt-1">
                  {comment.text}
                </Typography>

                {/* Replies */}
                {comment.replies?.length > 0 && (
                  <div className="mt-2 ml-4 space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply._id} className="flex space-x-2">
                        <Avatar
                          style={{
                            backgroundColor: getDepartmentColor(reply.user.department),
                            width: 24,
                            height: 24
                          }}
                        >
                          {getInitials(reply.user.name)}
                        </Avatar>
                        <div className="flex-1 bg-gray-50 p-2 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <Typography variant="subtitle2">
                                {reply.user.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {reply.user.department} • {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                              </Typography>
                            </div>
                            {(currentUser._id === reply.user._id || currentUser.role === 'admin') && (
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(reply._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </div>
                          <Typography className="mt-1">
                            {reply.text}
                          </Typography>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Paper>
        ))}
      </div>
    </Box>
  );
};

export default TaskComments; 