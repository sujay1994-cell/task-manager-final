import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  LinearProgress,
  Chip,
  IconButton,
  Alert
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  DragHandle as DragIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const FileUpload = ({ open, onClose, task, onUploadComplete }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'audio/*': ['.mp3', '.wav']
    },
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      files.forEach((fileObj, index) => {
        formData.append('files', fileObj.file);
        formData.append('fileOrder', index);
      });
      formData.append('taskId', task._id);
      formData.append('feedback', feedback);
      formData.append('uploadedBy', user.id);

      const response = await axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });

      if (onUploadComplete) {
        onUploadComplete(response.data);
      }
      
      handleClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Error uploading files');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleClose = () => {
    setFiles([]);
    setFeedback('');
    setError('');
    files.forEach(fileObj => {
      if (fileObj.preview) {
        URL.revokeObjectURL(fileObj.preview);
      }
    });
    onClose();
  };

  const removeFile = (fileId) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFiles(items);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Upload Files
        {task && (
          <Typography variant="subtitle2" color="textSecondary">
            {task.title}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          {...getRootProps()}
          sx={{
            p: 3,
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            borderRadius: 1,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            mb: 2
          }}
        >
          <input {...getInputProps()} />
          <UploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography>
            {isDragActive
              ? 'Drop the files here'
              : 'Drag & drop files here, or click to select files'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Supported formats: Images, PDF, DOC, DOCX, MP3, WAV (Max: 50MB)
          </Typography>
        </Box>

        {files.length > 0 && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="fileList">
              {(provided) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{ mb: 2 }}
                >
                  {files.map((fileObj, index) => (
                    <Draggable
                      key={fileObj.id}
                      draggableId={fileObj.id}
                      index={index}
                    >
                      {(provided) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1,
                            mb: 1,
                            border: '1px solid',
                            borderColor: 'grey.300',
                            borderRadius: 1
                          }}
                        >
                          <Box {...provided.dragHandleProps} sx={{ mr: 1 }}>
                            <DragIcon color="action" />
                          </Box>
                          {fileObj.preview ? (
                            <img
                              src={fileObj.preview}
                              alt="preview"
                              style={{
                                width: 40,
                                height: 40,
                                objectFit: 'cover',
                                marginRight: 8
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: 'grey.100',
                                mr: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {fileObj.file.type.split('/')[0]}
                            </Box>
                          )}
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2">
                              {fileObj.file.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => removeFile(fileObj.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        )}

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Version Notes/Feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          sx={{ mb: 2 }}
        />

        {uploading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" align="center" display="block">
              Uploading: {progress}%
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          startIcon={<UploadIcon />}
        >
          Upload Files
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileUpload; 