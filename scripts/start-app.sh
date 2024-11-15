#!/bin/bash

# Start backend
cd backend
npm start &

# Start frontend
cd ../frontend
npm start 