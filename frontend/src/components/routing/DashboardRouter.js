import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SuperAdminDashboard from '../admin/SuperAdminDashboard';
import SuperManagerDashboard from '../manager/SuperManagerDashboard';
import SalesManagerDashboard from '../manager/SalesManagerDashboard';
import EditorialManagerDashboard from '../manager/EditorialManagerDashboard';
import DesignManagerDashboard from '../manager/DesignManagerDashboard';
import TeamMemberDashboard from '../team/TeamMemberDashboard';
import DashboardLayout from '../layout/DashboardLayout';

const DashboardRouter = () => {
  const currentUser = useSelector(state => state.auth.user);

  // Helper function to determine dashboard component based on role
  const getDashboardComponent = () => {
    switch (currentUser.role) {
      case 'super_admin':
        return <SuperAdminDashboard />;
      case 'super_manager':
        return <SuperManagerDashboard />;
      case 'sales_manager':
        return <SalesManagerDashboard />;
      case 'editorial_manager':
        return <EditorialManagerDashboard />;
      case 'design_manager':
        return <DesignManagerDashboard />;
      case 'sales_member':
      case 'editorial_member':
      case 'design_member':
        return <TeamMemberDashboard />;
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <DashboardLayout>
      <Routes>
        {/* Home route - redirects to appropriate dashboard */}
        <Route path="/" element={getDashboardComponent()} />

        {/* Super Admin and Super Manager Routes */}
        {(currentUser.role === 'super_admin' || currentUser.role === 'super_manager') && (
          <>
            <Route path="/sales/*" element={<SalesManagerDashboard />} />
            <Route path="/editorial/*" element={<EditorialManagerDashboard />} />
            <Route path="/design/*" element={<DesignManagerDashboard />} />
          </>
        )}

        {/* Department Manager Routes */}
        {currentUser.role.includes('manager') && (
          <Route path="/team/*" element={getDashboardComponent()} />
        )}

        {/* Common Routes */}
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/profile" element={<UserProfile />} />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardRouter; 