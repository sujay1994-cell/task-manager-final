const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

function createTestServer() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet());
  app.use(compression());
  app.use(cors());

  // Import routes
  const authRoutes = require('../backend/routes/auth');
  const brandRoutes = require('../backend/routes/brands');
  const editionRoutes = require('../backend/routes/editions');
  const taskRoutes = require('../backend/routes/tasks');
  const userRoutes = require('../backend/routes/users');

  // Mount routes
  app.use('/api/auth', authRoutes);
  app.use('/api/brands', brandRoutes);
  app.use('/api/editions', editionRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/users', userRoutes);

  return app;
}

module.exports = createTestServer; 