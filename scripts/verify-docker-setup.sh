#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Starting Docker services verification..."

# Check Docker and Docker Compose installation
echo -e "\n${YELLOW}Checking Docker installation:${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed${NC}"
    exit 1
fi
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"

# Start services
echo -e "\n${YELLOW}Starting services:${NC}"
docker-compose down -v
docker-compose up -d

# Wait for services to be ready
echo -e "\n${YELLOW}Waiting for services to be ready...${NC}"
sleep 30

# Check if containers are running
echo -e "\n${YELLOW}Checking container status:${NC}"
services=("magazine-frontend" "magazine-backend" "magazine-mongodb")
for service in "${services[@]}"; do
    if [ "$(docker ps -q -f name=$service)" ]; then
        echo -e "${GREEN}✓ $service is running${NC}"
    else
        echo -e "${RED}✗ $service failed to start${NC}"
        docker-compose logs $service
        exit 1
    fi
done

# Test backend health
echo -e "\n${YELLOW}Testing backend health:${NC}"
if curl -f http://localhost:5000/health &>/dev/null; then
    echo -e "${GREEN}✓ Backend health check passed${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    docker-compose logs backend
    exit 1
fi

# Test frontend health
echo -e "\n${YELLOW}Testing frontend health:${NC}"
if curl -f http://localhost/health &>/dev/null; then
    echo -e "${GREEN}✓ Frontend health check passed${NC}"
else
    echo -e "${RED}✗ Frontend health check failed${NC}"
    docker-compose logs frontend
    exit 1
fi

# Test MongoDB connection
echo -e "\n${YELLOW}Testing MongoDB connection:${NC}"
if docker exec magazine-backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('MongoDB connection successful');
    process.exit(0);
}).catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
});" &>/dev/null; then
    echo -e "${GREEN}✓ MongoDB connection successful${NC}"
else
    echo -e "${RED}✗ MongoDB connection failed${NC}"
    docker-compose logs mongodb
    exit 1
fi

# Test API communication
echo -e "\n${YELLOW}Testing API communication:${NC}"
if curl -f http://localhost/api/health &>/dev/null; then
    echo -e "${GREEN}✓ Frontend to Backend communication successful${NC}"
else
    echo -e "${RED}✗ Frontend to Backend communication failed${NC}"
    echo -e "${YELLOW}Checking nginx configuration:${NC}"
    docker exec magazine-frontend nginx -T
fi

# Check network connectivity
echo -e "\n${YELLOW}Checking network connectivity:${NC}"
docker network inspect magazine-frontend-network &>/dev/null && \
    echo -e "${GREEN}✓ Frontend network exists${NC}" || \
    echo -e "${RED}✗ Frontend network missing${NC}"
docker network inspect magazine-backend-network &>/dev/null && \
    echo -e "${GREEN}✓ Backend network exists${NC}" || \
    echo -e "${RED}✗ Backend network missing${NC}"

# Check logs for errors
echo -e "\n${YELLOW}Checking service logs for errors:${NC}"
for service in "${services[@]}"; do
    if docker-compose logs $service | grep -i "error"; then
        echo -e "${RED}✗ Found errors in $service logs${NC}"
    else
        echo -e "${GREEN}✓ No errors found in $service logs${NC}"
    fi
done

echo -e "\n${GREEN}Docker setup verification completed!${NC}" 