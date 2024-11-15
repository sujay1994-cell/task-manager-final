#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Setting up Magazine Task Manager on Replit...${NC}"

# Install Node.js and npm using nvm
echo -e "\n${YELLOW}Installing Node.js and npm...${NC}"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 16
nvm use 16

# Verify installations
echo -e "\n${YELLOW}Verifying installations...${NC}"
node --version
npm --version

# Install project dependencies
echo -e "\n${YELLOW}Installing project dependencies...${NC}"
npm install

# Create necessary directories
echo -e "\n${YELLOW}Creating project structure...${NC}"
mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p frontend/src

# Set up environment variables
echo -e "\n${YELLOW}Setting up environment variables...${NC}"
cat > .env << EOL
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/magazine_db
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=24h
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=50000000
EOL

# Start the application
echo -e "\n${GREEN}Setup complete! Starting the application...${NC}"
npm start 