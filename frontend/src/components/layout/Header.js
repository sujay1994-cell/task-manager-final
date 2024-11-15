import React from 'react';
import { AppBar, Toolbar, Box, IconButton, styled } from '@mui/material';
import NotificationBell from '../notifications/NotificationBell';
import UserMenu from './UserMenu';
import { ReactComponent as LogoSVG } from '../../assets/logo/logo.svg';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  '& .app-logo': {
    height: 40,
    width: 'auto',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'scale(1.05)',
    }
  },
  '& .app-name': {
    color: theme.palette.primary.main,
    fontWeight: 600,
    fontSize: '1.25rem',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    }
  }
}));

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const Header = () => {
  return (
    <StyledAppBar position="sticky" elevation={0}>
      <Toolbar className="header-container">
        <LogoContainer className="logo-section">
          <LogoSVG className="app-logo" aria-label="Magazine Task Manager Logo" />
          <span className="app-name">Magazine Task Manager</span>
        </LogoContainer>
        
        <ActionsContainer>
          <NotificationBell />
          <UserMenu />
        </ActionsContainer>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header; 