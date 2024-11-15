import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Button,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Assignment as TaskIcon,
  Book as EditionIcon
} from '@mui/icons-material';
import TeamManagement from './TeamManagement';
import TaskManagement from './TaskManagement';
import EditionManagement from './EditionManagement';
import CreateTaskModal from '../tasks/CreateTaskModal';
import CreateEditionModal from '../editions/CreateEditionModal';

const SalesManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createEditionOpen, setCreateEditionOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="p-4">
      <Box className="mb-4 flex justify-between items-center">
        <Typography variant="h4">Sales Department Dashboard</Typography>
        <Box className="space-x-2">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateTaskOpen(true)}
          >
            New Task
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => setCreateEditionOpen(true)}
          >
            New Edition
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} className="mb-4">
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Team Performance
              </Typography>
              <Typography variant="h3">85%</Typography>
              <Box className="mt-2">
                <Chip label="12 Active Members" color="primary" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Tasks
              </Typography>
              <Typography variant="h3">24</Typography>
              <Box className="mt-2">
                <Chip label="8 Pending Approval" color="warning" size="small" className="mr-1" />
                <Chip label="4 Overdue" color="error" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Editions
              </Typography>
              <Typography variant="h3">5</Typography>
              <Box className="mt-2">
                <Chip label="2 Launching Soon" color="info" size="small" />
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
            <Tab icon={<TaskIcon />} label="Task Management" />
            <Tab icon={<PeopleIcon />} label="Team Management" />
            <Tab icon={<EditionIcon />} label="Edition Management" />
          </Tabs>

          <Box className="mt-4">
            {activeTab === 0 && <TaskManagement department="Sales" />}
            {activeTab === 1 && <TeamManagement department="Sales" />}
            {activeTab === 2 && <EditionManagement />}
          </Box>
        </CardContent>
      </Card>

      <CreateTaskModal
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        department="Sales"
      />

      <CreateEditionModal
        open={createEditionOpen}
        onClose={() => setCreateEditionOpen(false)}
      />
    </Box>
  );
};

export default SalesManagerDashboard; 