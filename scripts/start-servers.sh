#!/bin/bash

# Kill any processes using our ports
kill_port() {
    lsof -i tcp:$1 | awk 'NR!=1 {print $2}' | xargs -r kill
}

# Kill processes on both frontend and backend ports
kill_port 3000
kill_port 5000

# Start backend server
cd backend
PORT=5000 node server.js &

# Wait for backend to start
sleep 5

# Start frontend server
cd ../frontend
PORT=3000 npm start 