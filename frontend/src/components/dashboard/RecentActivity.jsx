import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Chip,
  Divider
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Edit as EditIcon,
  CheckCircle as ApproveIcon,
  Upload as UploadIcon,
  Comment as CommentIcon
} from '@mui/icons-material';

const RecentActivity = ({ tasks }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'created':
        return <TaskIcon color="primary" />;
      case 'updated':
        return <EditIcon color="info" />;
      case 'approved':
        return <ApproveIcon color="success" />;
      case 'file_uploaded':
        return <UploadIcon color="secondary" />;
      case 'comment_added':
        return <CommentIcon color="action" />;
      default:
        return <TaskIcon />;
    }
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
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {tasks.length === 0 ? (
        <ListItem>
          <ListItemText
            primary="No recent activity"
            secondary="New activities will appear here"
          />
        </ListItem>
      ) : (
        tasks.map((task, index) => (
          <React.Fragment key={task._id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'background.paper' }}>
                  {getActivityIcon(task.activityType)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2">
                      {task.title}
                    </Typography>
                    <Chip
                      label={task.status}
                      size="small"
                      color={
                        task.status === 'completed' ? 'success' :
                        task.status === 'in_progress' ? 'info' :
                        task.status === 'review' ? 'warning' : 'default'
                      }
                    />
                  </Box>
                }
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {task.brand.name} {'>'} {task.edition.name}
                    </Typography>
                    <Typography
                      component="div"
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {task.lastActivity} • {getTimeAgo(task.updatedAt)}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < tasks.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))
      )}
    </List>
  );
};

export default RecentActivity; 