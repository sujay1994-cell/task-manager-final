import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <nav className="main-nav">
          <button onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button onClick={() => navigate('/tasks')}>Tasks</button>
          <button onClick={() => navigate('/calendar')}>Calendar</button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 