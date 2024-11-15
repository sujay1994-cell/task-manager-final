import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Chip,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Close as RejectIcon,
  Refresh as ReopenIcon,
  Comment as CommentIcon,
  AttachFile as FileIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { checkPermission } from '../../utils/permissions';

const TaskCard = ({ task, onAction, onEdit, onDelete }) => {
  const { user } = useAuth();
  
  const permissions = {
    canEdit: checkPermission(user, 'canEditTasks') && 
             (user.department === task.department || task.assignedTo === user.id),
    canApprove: checkPermission(user, 'canApproveTasks') && 
                user.department === task.department,
    canDelete: checkPermission(user, 'canDeleteTasks'),
    canReopen: checkPermission(user, 'canReopenTasks') && 
               user.department === 'sales',
    canComment: true // Everyone can comment
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'default';
      case 'in_progress': return 'info';
      case 'review': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const isOverdue = new Date(task.deadline) < new Date() && 
                    task.status !== 'completed';

  return (
    <Card 
      elevation={3}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: isOverdue ? '4px solid #f44336' : 'none'
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div">
            {task.title}
          </Typography>
          <Chip
            label={task.status}
            color={getStatusColor(task.status)}
            size="small"
          />
        </Box>

        <Typography color="textSecondary" gutterBottom>
          {task.brand.name} {'>'} {task.edition.name}
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Chip
            label={task.type}
            size="small"
            variant="outlined"
          />
          {task.priority === 'high' && (
            <Chip
              label="High Priority"
              color="error"
              size="small"
            />
          )}
          {task.files?.length > 0 && (
            <Chip
              icon={<FileIcon />}
              label={task.files.length}
              size="small"
            />
          )}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="textSecondary">
            Deadline: {new Date(task.deadline).toLocaleDateString()}
          </Typography>
          {isOverdue && (
            <Typography variant="caption" color="error" sx={{ ml: 1 }}>
              (Overdue)
            </Typography>
          )}
        </Box>

        <LinearProgress 
          variant="determinate" 
          value={task.progress || 0}
          sx={{ mt: 2 }}
          color={isOverdue ? 'error' : 'primary'}
        />
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
        {permissions.canComment && (
          <Tooltip title="Comments">
            <IconButton size="small" onClick={() => onAction(task._id, 'comment')}>
              <CommentIcon />
            </IconButton>
          </Tooltip>
        )}

        {permissions.canApprove && task.status === 'review' && (
          <>
            <Tooltip title="Approve">
              <IconButton 
                size="small" 
                color="success"
                onClick={() => onAction(task._id, 'approve')}
              >
                <ApproveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Request Changes">
              <IconButton 
                size="small" 
                color="error"
                onClick={() => onAction(task._id, 'reject')}
              >
                <RejectIcon />
              </IconButton>
            </Tooltip>
          </>
        )}

        {permissions.canReopen && task.status === 'completed' && (
          <Tooltip title="Reopen Task">
            <IconButton 
              size="small"
              onClick={() => onAction(task._id, 'reopen')}
            >
              <ReopenIcon />
            </IconButton>
          </Tooltip>
        )}

        {permissions.canEdit && (
          <Tooltip title="Edit Task">
            <IconButton 
              size="small"
              onClick={() => onEdit(task)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}

        {permissions.canDelete && (
          <Tooltip title="Delete Task">
            <IconButton 
              size="small"
              color="error"
              onClick={() => onDelete(task._id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
};

export default TaskCard; 