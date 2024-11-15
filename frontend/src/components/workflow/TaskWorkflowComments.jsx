import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreIcon,
  AttachFile as AttachIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const TaskWorkflowComments = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && attachments.length === 0) return;

    try {
      const formData = new FormData();
      formData.append('content', newComment);
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await axios.post(`/api/tasks/${taskId}/comments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setComments([...comments, response.data]);
      setNewComment('');
      setAttachments([]);
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}/comments/${commentId}`);
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
    handleMenuClose();
  };

  const handleEdit = async (commentId, newContent) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}/comments/${commentId}`, {
        content: newContent
      });
      setComments(comments.map(comment => 
        comment._id === commentId ? response.data : comment
      ));
    } catch (error) {
      console.error('Error editing comment:', error);
    }
    handleMenuClose();
  };

  const handleMenuClick = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return 'just now';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Discussion
      </Typography>

      <List>
        {comments.map((comment) => (
          <React.Fragment key={comment._id}>
            <ListItem
              alignItems="flex-start"
              secondaryAction={
                comment.user._id === user.id && (
                  <IconButton
                    edge="end"
                    onClick={(e) => handleMenuClick(e, comment)}
                  >
                    <MoreIcon />
                  </IconButton>
                )
              }
            >
              <ListItemAvatar>
                <Avatar alt={comment.user.name} src={comment.user.avatar} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">
                      {comment.user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getTimeAgo(comment.createdAt)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {comment.content}
                    </Typography>
                    {comment.attachments?.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {comment.attachments.map((attachment, index) => (
                          <Button
                            key={index}
                            size="small"
                            startIcon={<AttachIcon />}
                            href={attachment.url}
                            target="_blank"
                            sx={{ mr: 1, mb: 1 }}
                          >
                            {attachment.filename}
                          </Button>
                        ))}
                      </Box>
                    )}
                  </>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{ mb: 1 }}
        />
        
        {attachments.length > 0 && (
          <Box sx={{ mb: 1 }}>
            {attachments.map((file, index) => (
              <Chip
                key={index}
                label={file.name}
                onDelete={() => removeAttachment(index)}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            component="label"
            startIcon={<AttachIcon />}
          >
            Attach Files
            <input
              type="file"
              multiple
              hidden
              onChange={handleFileSelect}
            />
          </Button>
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            type="submit"
            disabled={!newComment.trim() && attachments.length === 0}
          >
            Send
          </Button>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          setNewComment(selectedComment?.content);
          handleMenuClose();
        }}>
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedComment?._id)}>
          Delete
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default TaskWorkflowComments; 