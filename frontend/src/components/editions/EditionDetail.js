import React, { useState } from 'react';
import { Button } from '@mui/material';
import { Rocket as RocketIcon } from '@mui/icons-material';
import LaunchRequestModal from './LaunchRequestModal';
import { useSelector } from 'react-redux';

const EditionDetail = ({ edition }) => {
  const [launchModalOpen, setLaunchModalOpen] = useState(false);
  const currentUser = useSelector(state => state.auth.user);
  const canRequestLaunch = currentUser.department === 'Sales' || currentUser.role === 'admin';

  return (
    <div>
      {/* Existing edition details... */}
      
      {canRequestLaunch && edition.status !== 'completed' && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<RocketIcon />}
          onClick={() => setLaunchModalOpen(true)}
        >
          Request Launch
        </Button>
      )}

      <LaunchRequestModal
        open={launchModalOpen}
        onClose={() => setLaunchModalOpen(false)}
        edition={edition}
      />
    </div>
  );
}; 