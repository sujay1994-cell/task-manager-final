#!/bin/bash

echo "Debugging Docker services..."

# Check network connectivity between services
echo "Testing backend to MongoDB connectivity..."
docker exec magazine-backend ping -c 2 mongodb

echo "Testing frontend to backend connectivity..."
docker exec magazine-frontend curl -I http://backend:5000/health

# Check environment variables
echo "Checking backend environment variables..."
docker exec magazine-backend printenv | grep MONGODB_URI
docker exec magazine-backend printenv | grep JWT_SECRET

echo "Checking frontend environment variables..."
docker exec magazine-frontend printenv | grep REACT_APP_API_URL

# Check MongoDB logs for connection issues
echo "Checking MongoDB logs for errors..."
docker logs magazine-mongodb | grep -i error

# Check network DNS resolution
echo "Testing DNS resolution..."
docker exec magazine-backend nslookup mongodb
docker exec magazine-frontend nslookup backend 