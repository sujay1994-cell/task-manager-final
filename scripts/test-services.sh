#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Testing Docker services..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if services are running
echo -e "\n${YELLOW}Checking service status:${NC}"
services=("magazine-frontend" "magazine-backend" "magazine-mongodb")
for service in "${services[@]}"; do
    if docker ps | grep -q $service; then
        echo -e "${GREEN}✓ $service is running${NC}"
    else
        echo -e "${RED}✗ $service is not running${NC}"
    fi
done

# Check backend health
echo -e "\n${YELLOW}Testing backend health:${NC}"
if curl -f http://localhost:5000/health >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend health check passed${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
fi

# Check frontend health
echo -e "\n${YELLOW}Testing frontend health:${NC}"
if curl -f http://localhost/health >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend health check passed${NC}"
else
    echo -e "${RED}✗ Frontend health check failed${NC}"
fi

# Check MongoDB connection
echo -e "\n${YELLOW}Testing MongoDB connection:${NC}"
if docker exec magazine-backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('MongoDB connection successful');
    process.exit(0);
}).catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
});" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ MongoDB connection successful${NC}"
else
    echo -e "${RED}✗ MongoDB connection failed${NC}"
fi

# Check network connectivity
echo -e "\n${YELLOW}Testing network connectivity:${NC}"
networks=("magazine-frontend-network" "magazine-backend-network")
for network in "${networks[@]}"; do
    if docker network inspect $network >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Network $network exists${NC}"
    else
        echo -e "${RED}✗ Network $network does not exist${NC}"
    fi
done 