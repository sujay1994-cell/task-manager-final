import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Badge
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import FileUpload from '../files/FileUpload';
import axios from 'axios';

const TaskComments = ({ taskId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [files, setFiles] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && files.length === 0) return;

    try {
      const formData = new FormData();
      formData.append('content', newComment);
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post(`/api/tasks/${taskId}/comments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setComments([...comments, response.data]);
      setNewComment('');
      setFiles([]);
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleEdit = async (commentId, content) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}/comments/${commentId}`, {
        content
      });
      setComments(comments.map(c => c._id === commentId ? response.data : c));
      setEditMode(false);
      setSelectedComment(null);
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
    handleMenuClose();
  };

  const handleMenuClick = (event, comment) => {
    setMenuAnchor(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedComment(null);
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

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Comments & Feedback
      </Typography>

      <List>
        {comments.map((comment) => (
          <React.Fragment key={comment._id}>
            <ListItem
              alignItems="flex-start"
              secondaryAction={
                comment.user._id === user.id && (
                  <IconButton onClick={(e) => handleMenuClick(e, comment)}>
                    <MoreIcon />
                  </IconButton>
                )
              }
            >
              <ListItemAvatar>
                <Avatar src={comment.user.avatar}>
                  {comment.user.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">
                      {comment.user.name}
                    </Typography>
                    <Chip
                      label={comment.user.department}
                      size="small"
                      variant="outlined"
                    />
                    {comment.isUrgent && (
                      <FlagIcon color="error" fontSize="small" />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    {editMode && selectedComment?._id === comment._id ? (
                      <Box sx={{ mt: 1 }}>
                        <TextField
                          fullWidth
                          multiline
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          size="small"
                        />
                        <Box sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            onClick={() => handleEdit(comment._id, newComment)}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            onClick={() => setEditMode(false)}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {comment.content}
                        </Typography>
                        {comment.files?.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {comment.files.map((file, index) => (
                              <Chip
                                key={index}
                                icon={<AttachIcon />}
                                label={file.filename}
                                variant="outlined"
                                size="small"
                                onClick={() => window.open(file.url)}
                                sx={{ mr: 1, mb: 1 }}
                              />
                            ))}
                          </Box>
                        )}
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          {getTimeAgo(comment.createdAt)}
                          {comment.isEdited && ' (edited)'}
                        </Typography>
                      </>
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
          rows={3}
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            startIcon={<AttachIcon />}
            onClick={() => setUploadOpen(true)}
          >
            Attach Files
          </Button>
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            type="submit"
            disabled={!newComment.trim() && files.length === 0}
          >
            Send
          </Button>
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          setEditMode(true);
          setNewComment(selectedComment?.content);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedComment?._id)}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <FileUpload
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={setFiles}
        multiple
      />
    </Paper>
  );
};

export default TaskComments; 