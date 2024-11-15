import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  Badge
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  History as VersionIcon,
  Comment as CommentIcon,
  CheckCircle as ApprovedIcon,
  Error as RevisionIcon,
  AccessTime as PendingIcon
} from '@mui/icons-material';
import FileUpload from '../files/FileUpload';
import VersionHistory from '../files/VersionHistory';
import { useAuth } from '../../contexts/AuthContext';

const MyDesigns = ({ tasks }) => {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <ApprovedIcon color="success" />;
      case 'revision':
        return <RevisionIcon color="error" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      default:
        return <PendingIcon />;
    }
  };

  const getDesignPreview = (task) => {
    if (task.files && task.files.length > 0) {
      const latestFile = task.files[task.files.length - 1];
      if (latestFile.type.startsWith('image/')) {
        return latestFile.url;
      }
    }
    return null;
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {tasks.map((task) => {
          const preview = getDesignPreview(task);
          return (
            <Grid item xs={12} sm={6} md={4} key={task._id}>
              <Card 
                elevation={3}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {preview ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={preview}
                    alt={task.title}
                    sx={{ objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      bgcolor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography color="textSecondary">
                      No preview available
                    </Typography>
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" noWrap>
                      {task.title}
                    </Typography>
                    <Tooltip title={task.status}>
                      <Badge
                        badgeContent={task.versions?.length || 0}
                        color="primary"
                      >
                        {getStatusIcon(task.status)}
                      </Badge>
                    </Tooltip>
                  </Box>

                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    {task.brand.name} {'>'} {task.edition.name}
                  </Typography>

                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={task.type}
                      size="small"
                      color="secondary"
                    />
                    {task.priority === 'high' && (
                      <Chip
                        label="High Priority"
                        size="small"
                        color="error"
                      />
                    )}
                    {task.comments?.length > 0 && (
                      <Chip
                        icon={<CommentIcon />}
                        label={task.comments.length}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {task.feedback && (
                    <Typography 
                      variant="body2" 
                      color="error"
                      sx={{ mt: 2, fontStyle: 'italic' }}
                    >
                      Latest feedback: {task.feedback}
                    </Typography>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<VersionIcon />}
                    onClick={() => {
                      setSelectedTask(task);
                      setVersionOpen(true);
                    }}
                  >
                    Versions
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<UploadIcon />}
                    onClick={() => {
                      setSelectedTask(task);
                      setUploadOpen(true);
                    }}
                    color="primary"
                  >
                    Upload
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* File Upload Dialog */}
      <FileUpload
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />

      {/* Version History Dialog */}
      <VersionHistory
        open={versionOpen}
        onClose={() => {
          setVersionOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </Box>
  );
};

export default MyDesigns; 