import React from 'react';
import { Box, styled } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import DeadlineSummary from '../dashboard/DeadlineSummary';

const LayoutRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.default
}));

const LayoutContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  width: '100%',
  overflow: 'hidden'
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: '1 1 auto',
  padding: theme.spacing(3),
  overflow: 'auto',
  minHeight: 0,
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  }
}));

const DashboardLayout = ({ children }) => {
  return (
    <LayoutRoot>
      <DeadlineSummary />
      <Sidebar />
      <LayoutContent>
        <Header />
        <MainContent>
          {children}
        </MainContent>
      </LayoutContent>
    </LayoutRoot>
  );
};

export default DashboardLayout; 