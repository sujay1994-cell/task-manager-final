import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as TaskIcon,
  VpnKey as RoleIcon,
  Add as AddIcon
} from '@mui/icons-material';
import UserList from './UserList';
import UserRoles from './UserRoles';
import UserTasksOverview from './UserTasksOverview';
import AddUserModal from './AddUserModal';

const UserManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedUser(null);
  };

  return (
    <Box className="p-4">
      <Box className="mb-4 flex justify-between items-center">
        <Typography variant="h4">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddUserModalOpen(true)}
        >
          Add New User
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} className="mb-4">
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Users</Typography>
              <Box className="flex justify-between items-end">
                <Typography variant="h3">48</Typography>
                <Box>
                  <Typography variant="caption" display="block">By Department:</Typography>
                  <Typography variant="body2">Sales: 15</Typography>
                  <Typography variant="body2">Editorial: 18</Typography>
                  <Typography variant="body2">Design: 15</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Active Tasks</Typography>
              <Typography variant="h3">156</Typography>
              <Typography variant="body2" color="textSecondary">
                Across all departments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Role Distribution</Typography>
              <Box>
                <Typography variant="body2">Managers: 6</Typography>
                <Typography variant="body2">Team Members: 42</Typography>
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
            <Tab icon={<PeopleIcon />} label="Users" />
            <Tab icon={<RoleIcon />} label="Roles & Permissions" />
            <Tab icon={<TaskIcon />} label="Task Assignment" />
          </Tabs>

          <Box className="mt-4">
            {activeTab === 0 && (
              <UserList
                onUserSelect={setSelectedUser}
                selectedUser={selectedUser}
              />
            )}
            {activeTab === 1 && (
              <UserRoles
                user={selectedUser}
                onUserSelect={setSelectedUser}
              />
            )}
            {activeTab === 2 && (
              <UserTasksOverview
                user={selectedUser}
                onUserSelect={setSelectedUser}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      <AddUserModal
        open={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
      />
    </Box>
  );
};

export default UserManagementDashboard; 