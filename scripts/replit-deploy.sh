#!/bin/bash

echo "🚀 Starting Replit deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🏗️ Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Setup environment
echo "⚙️ Setting up environment..."
if [ ! -f .env ]; then
  echo "Creating .env file..."
  echo "PORT=5000
MONGODB_URI=$MONGODB_URI
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
FRONTEND_URL=https://$REPL_SLUG.$REPL_OWNER.repl.co" > .env
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads

# Start the application
echo "🚀 Starting the application..."
npm run start:prod 