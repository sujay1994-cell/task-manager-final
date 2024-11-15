import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper,
  Typography,
  Divider,
  Box,
  Tabs,
  Tab,
  Badge,
  Button
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Comment as CommentIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import FileUpload from '../files/FileUpload';
import FileVersionHistory from '../files/FileVersionHistory';
import TaskComments from './TaskComments';
import { getFileVersions, getTaskComments } from '../../features/tasks/tasksSlice';
import TaskStatus from './TaskStatus';
import EditionSignOffDialog from '../editions/EditionSignOffDialog';

const TaskDetail = ({ task }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const fileVersions = useSelector(state => state.tasks.fileVersions[task._id] || []);
  const comments = useSelector(state => state.tasks.comments[task._id] || []);
  const [signOffDialogOpen, setSignOffDialogOpen] = useState(false);
  const currentUser = useSelector(state => state.auth.user);
  const isDesigner = currentUser.department === 'Design';
  const isPrintTask = task.name.startsWith('Generate Print');

  useEffect(() => {
    dispatch(getFileVersions(task._id));
    dispatch(getTaskComments(task._id));
  }, [dispatch, task._id]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleUploadComplete = () => {
    dispatch(getFileVersions(task._id));
  };

  return (
    <Paper className="p-4">
      <Typography variant="h6" className="mb-4">
        {task.name}
      </Typography>

      <Box className="mb-6">
        <TaskStatus task={task} />
      </Box>

      <Tabs value={activeTab} onChange={handleTabChange} className="mb-4">
        <Tab
          icon={<DescriptionIcon />}
          label="Details"
        />
        <Tab
          icon={
            <Badge badgeContent={fileVersions.length} color="primary">
              <AttachFileIcon />
            </Badge>
          }
          label="Files & Versions"
        />
        <Tab
          icon={
            <Badge badgeContent={comments.length} color="primary">
              <CommentIcon />
            </Badge>
          }
          label="Comments"
        />
      </Tabs>

      <Divider className="mb-4" />

      {activeTab === 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>Task Details</Typography>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Typography color="textSecondary">Type</Typography>
              <Typography>{task.type}</Typography>
            </div>
            <div>
              <Typography color="textSecondary">Department</Typography>
              <Typography>{task.department}</Typography>
            </div>
            <div>
              <Typography color="textSecondary">Status</Typography>
              <Typography>{task.status}</Typography>
            </div>
            <div>
              <Typography color="textSecondary">Deadline</Typography>
              <Typography>
                {new Date(task.deadline).toLocaleDateString()}
              </Typography>
            </div>
            <div>
              <Typography color="textSecondary">Assigned To</Typography>
              <Typography>{task.assignedTo?.name || 'Unassigned'}</Typography>
            </div>
            <div>
              <Typography color="textSecondary">Priority</Typography>
              <Typography>{task.priority}</Typography>
            </div>
          </div>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <FileUpload
            taskId={task._id}
            onUploadComplete={handleUploadComplete}
          />
          <Box className="mt-4">
            <FileVersionHistory versions={fileVersions} />
          </Box>
        </Box>
      )}

      {activeTab === 2 && (
        <TaskComments taskId={task._id} comments={comments} />
      )}

      {isDesigner && isPrintTask && task.status === 'completed' && (
        <Box className="mt-4">
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={() => setSignOffDialogOpen(true)}
          >
            Sign Off & Complete Edition
          </Button>
        </Box>
      )}

      <EditionSignOffDialog
        open={signOffDialogOpen}
        onClose={() => setSignOffDialogOpen(false)}
        edition={task.edition}
        printTask={task}
      />
    </Paper>
  );
};

export default TaskDetail; 