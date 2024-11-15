import React from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Logo = () => {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate('/dashboard')}
      sx={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.05)'
        }
      }}
    >
      <img
        src="/logo.svg"
        alt="Magazine Task Manager"
        style={{
          height: '40px',
          width: 'auto',
          maxWidth: '100%'
        }}
      />
    </Box>
  );
};

export default Logo; 