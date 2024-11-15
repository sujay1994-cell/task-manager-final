import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Button,
  Chip,
  Divider,
  Tooltip
} from '@mui/material';
import {
  GetApp as DownloadIcon,
  Visibility as PreviewIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import FilePreview from './FilePreview';

const VersionHistory = ({ open, onClose, task }) => {
  const { user } = useAuth();
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const canDeleteVersion = user.role.includes('manager') || 
                          task?.assignedTo === user.id;

  const handleDownload = async (version) => {
    try {
      const response = await axios.get(`/api/files/${version._id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', version.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handlePreview = (version) => {
    setSelectedVersion(version);
    setPreviewOpen(true);
  };

  const handleDelete = async (version) => {
    if (!canDeleteVersion) return;
    
    if (window.confirm('Are you sure you want to delete this version?')) {
      try {
        await axios.delete(`/api/files/${version._id}`);
        // Refresh task data
        onClose();
      } catch (error) {
        console.error('Error deleting version:', error);
      }
    }
  };

  const handleRestore = async (version) => {
    try {
      await axios.post(`/api/tasks/${task._id}/restore-version`, {
        versionId: version._id
      });
      onClose();
    } catch (error) {
      console.error('Error restoring version:', error);
    }
  };

  const getVersionLabel = (index, totalVersions) => {
    if (index === totalVersions - 1) return 'Latest Version';
    if (index === 0) return 'Original Version';
    return `Version ${index + 1}`;
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Version History</Typography>
            <Typography variant="subtitle2" color="textSecondary">
              {task?.title}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <List>
            {task?.files.map((version, index) => (
              <React.Fragment key={version._id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <Tooltip title="Preview">
                        <IconButton
                          edge="end"
                          onClick={() => handlePreview(version)}
                        >
                          <PreviewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton
                          edge="end"
                          onClick={() => handleDownload(version)}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      {canDeleteVersion && (
                        <Tooltip title="Delete Version">
                          <IconButton
                            edge="end"
                            onClick={() => handleDelete(version)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {index !== task.files.length - 1 && (
                        <Tooltip title="Restore This Version">
                          <IconButton
                            edge="end"
                            onClick={() => handleRestore(version)}
                            color="warning"
                          >
                            <RestoreIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      {index + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {version.fileName}
                        <Chip
                          label={getVersionLabel(index, task.files.length)}
                          size="small"
                          color={index === task.files.length - 1 ? 'primary' : 'default'}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          Uploaded by {version.uploadedBy.name} • {new Date(version.uploadedAt).toLocaleString()}
                        </Typography>
                        {version.feedback && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <CommentIcon fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {version.feedback}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      <FilePreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        file={selectedVersion}
      />
    </>
  );
};

export default VersionHistory; 