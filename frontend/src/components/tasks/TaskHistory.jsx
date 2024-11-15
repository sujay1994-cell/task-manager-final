import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondary,
  Chip,
  Divider,
  Avatar
} from '@mui/material';
import {
  Upload as UploadIcon,
  Edit as EditIcon,
  Person as AssignIcon,
  CheckCircle as CompleteIcon,
  History as HistoryIcon
} from '@mui/icons-material';

const TaskHistory = ({ history, files }) => {
  const getActionIcon = (action) => {
    switch (action) {
      case 'FILE_UPLOAD':
        return <UploadIcon />;
      case 'STATUS_CHANGE':
        return <EditIcon />;
      case 'ASSIGNMENT_CHANGE':
        return <AssignIcon />;
      case 'TASK_COMPLETED':
        return <CompleteIcon />;
      default:
        return <HistoryIcon />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'FILE_UPLOAD':
        return 'info';
      case 'STATUS_CHANGE':
        return 'warning';
      case 'ASSIGNMENT_CHANGE':
        return 'secondary';
      case 'TASK_COMPLETED':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Task History
      </Typography>

      <List>
        {history.map((event, index) => (
          <React.Fragment key={event._id}>
            <ListItem alignItems="flex-start">
              <ListItemIcon>
                {getActionIcon(event.action)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">
                      {event.user.name}
                    </Typography>
                    <Chip
                      label={event.action.replace('_', ' ')}
                      size="small"
                      color={getActionColor(event.action)}
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {event.details}
                    </Typography>
                    <Typography
                      component="div"
                      variant="caption"
                      color="text.secondary"
                    >
                      {new Date(event.timestamp).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            {index < history.length - 1 && <Divider variant="inset" />}
          </React.Fragment>
        ))}
      </List>

      {files.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            File History
          </Typography>
          <List>
            {files.map((file, index) => (
              <React.Fragment key={file._id}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    <UploadIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {file.filename}
                        </Typography>
                        <Chip
                          label={`Version ${file.version}`}
                          size="small"
                          color="info"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          Uploaded by {file.uploadedBy.name}
                        </Typography>
                        <Typography
                          component="div"
                          variant="caption"
                          color="text.secondary"
                        >
                          {new Date(file.uploadedAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < files.length - 1 && <Divider variant="inset" />}
              </React.Fragment>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
};

export default TaskHistory; 