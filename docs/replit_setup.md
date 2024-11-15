# Setting Up Magazine Task Manager on Replit

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Creating the Repl](#creating-the-repl)
3. [Environment Setup](#environment-setup)
4. [Database Configuration](#database-configuration)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

1. **Replit Account**
   - Sign up at [replit.com](https://replit.com) if you haven't already
   - Free account is sufficient for testing

2. **MongoDB Atlas Account**
   - Create a free account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   - We'll use this for the database

## Creating the Repl

1. **Create New Repl**
   - Click "Create Repl" button
   - Choose "Node.js" as your template
   - Name your repl "magazine-task-manager"
   - Click "Create Repl"

2. **Import Project**
   ```bash
   # In Replit shell
   git clone https://github.com/your-repo/magazine-task-manager.git .
   ```

## Environment Setup

1. **Create Secrets in Replit**
   - Click on "Tools" in the left sidebar
   - Select "Secrets"
   - Add the following secrets:

   ```env
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secure_jwt_secret
   NODE_ENV=production
   PORT=3000
   ```

2. **Update package.json**
   ```json
   {
     "scripts": {
       "start": "node backend/server.js",
       "dev": "nodemon backend/server.js"
     }
   }
   ```

## Database Configuration

1. **MongoDB Atlas Setup**
   - Create new cluster (free tier is fine)
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

2. **Update Connection String**
   - Replace `<password>` with your database password
   - Add to Replit secrets as MONGODB_URI

## Running the Application

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Start Command**
   - In Replit's "Commands" panel, set:
   ```bash
   npm start
   ```

3. **Start the Application**
   - Click the "Run" button
   - Wait for the server to start
   - You should see "Server running on port 3000"

4. **Access the Application**
   - Click on the "Web View" button
   - Your app should be running at your Replit URL

## Troubleshooting

### Common Issues and Solutions

1. **MongoDB Connection Error**
   ```bash
   # Check MongoDB connection
   node -e "
   const mongoose = require('mongoose');
   mongoose.connect(process.env.MONGODB_URI)
   .then(() => console.log('Connected'))
   .catch(err => console.error(err))
   "
   ```

2. **Port Already in Use**
   - Replit uses port 3000 by default
   - Update PORT in secrets if needed

3. **Dependencies Issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Reinstall dependencies
   rm -rf node_modules
   npm install
   ```

4. **File Permission Issues**
   ```bash
   # Fix permissions
   chmod -R 755 .
   ```

### Verifying Setup

1. **Check Server Status**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Test API Endpoints**
   ```bash
   # Test auth endpoint
   curl -X POST http://localhost:3000/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"test@example.com","password":"password"}'
   ```

3. **Monitor Logs**
   - Check Replit console for errors
   - Check MongoDB Atlas logs

## Additional Configuration

### Enable Automatic HTTPS

1. Add SSL configuration in Replit:
   ```javascript
   // Add to backend/server.js
   const app = express();
   app.set('trust proxy', 1);
   ```

### Configure CORS

1. Update CORS settings:
   ```javascript
   // In backend/server.js
   app.use(cors({
     origin: process.env.REPLIT_URL,
     credentials: true
   }));
   ```

### Setup Persistent Storage

1. Use Replit's persistent storage:
   ```javascript
   const fs = require('fs');
   const uploadDir = '.data/uploads';
   
   if (!fs.existsSync(uploadDir)){
     fs.mkdirSync(uploadDir, { recursive: true });
   }
   ```

## Maintenance

### Regular Tasks

1. **Monitor Resources**
   - Check Replit dashboard for resource usage
   - Monitor MongoDB Atlas metrics

2. **Update Dependencies**
   ```bash
   npm update
   ```

3. **Backup Data**
   - Use MongoDB Atlas automatic backups
   - Export important data regularly

### Security Best Practices

1. **Keep Secrets Secure**
   - Never commit .env files
   - Use Replit's secrets feature

2. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories

3. **Access Control**
   - Use strong passwords
   - Implement rate limiting

## Support

For additional help:
1. Check Replit documentation
2. Visit MongoDB Atlas documentation
3. Create issues in the project repository
4. Contact project maintainers 