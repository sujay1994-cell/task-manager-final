import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TaskSummaryCard = ({ title, count, icon, color, progress, isOverdue, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to filtered task list
      navigate(`/tasks?filter=${title.toLowerCase()}`);
    }
  };

  return (
    <Card 
      elevation={3}
      sx={{ 
        height: '100%',
        backgroundColor: isOverdue ? 'error.light' : 'background.paper',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          cursor: 'pointer'
        }
      }}
      onClick={handleClick}
    >
      <CardContent>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                mr: 2,
                color: `${color}.main`,
                display: 'flex'
              }}
            >
              {icon}
            </Box>
            <Typography 
              variant="h6" 
              color={isOverdue ? 'error' : 'textPrimary'}
            >
              {title}
            </Typography>
          </Box>
          {isOverdue && (
            <Tooltip title="Overdue Tasks">
              <WarningIcon color="error" />
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
          <Typography 
            variant="h3" 
            component="div" 
            color={isOverdue ? 'error' : `${color}.main`}
            sx={{ fontWeight: 'bold' }}
          >
            {count}
          </Typography>
          <Typography 
            variant="subtitle2" 
            color="textSecondary" 
            sx={{ ml: 1 }}
          >
            tasks
          </Typography>
        </Box>

        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              color={color}
              sx={{ 
                height: 6,
                borderRadius: 3
              }}
            />
            <Typography 
              variant="caption" 
              color="textSecondary"
              sx={{ mt: 0.5, display: 'block' }}
            >
              {progress}% Complete
            </Typography>
          </Box>
        )}

        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            mt: 2
          }}
        >
          <Tooltip title="View Details">
            <IconButton 
              size="small"
              color={color}
              sx={{ 
                backgroundColor: `${color}.light`,
                '&:hover': {
                  backgroundColor: `${color}.main`,
                  color: 'white'
                }
              }}
            >
              <ArrowIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskSummaryCard; 