import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Chip,
  Button
} from '@mui/material';
import {
  Assignment as TaskIcon,
  History as HistoryIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import MyTasks from './MyTasks';
import TaskHistory from './TaskHistory';
import TeamProgress from './TeamProgress';

const TeamMemberDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const currentUser = useSelector(state => state.auth.user);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="p-4">
      <Box className="mb-4">
        <Typography variant="h4" gutterBottom>
          {currentUser.department} Dashboard
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} className="mb-4">
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Active Tasks
              </Typography>
              <Typography variant="h3">5</Typography>
              <Box className="mt-2">
                <Chip 
                  label="2 Due Today" 
                  color="warning" 
                  size="small" 
                  className="mr-2"
                />
                <Chip 
                  label="3 Upcoming" 
                  color="info" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Reviews
              </Typography>
              <Typography variant="h3">2</Typography>
              <Box className="mt-2">
                <Chip 
                  label="Awaiting Feedback" 
                  color="primary" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Completed Tasks
              </Typography>
              <Typography variant="h3">12</Typography>
              <Box className="mt-2">
                <Chip 
                  label="This Week" 
                  color="success" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab icon={<TaskIcon />} label="My Tasks" />
            <Tab icon={<HistoryIcon />} label="Task History" />
            <Tab icon={<TimelineIcon />} label="Team Progress" />
          </Tabs>

          <Box className="mt-4">
            {activeTab === 0 && <MyTasks />}
            {activeTab === 1 && <TaskHistory />}
            {activeTab === 2 && <TeamProgress />}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeamMemberDashboard; 