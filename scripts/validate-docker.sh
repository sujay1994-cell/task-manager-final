#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting Docker image validation...${NC}"

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed${NC}"
    exit 1
fi

# Clean up existing containers
echo -e "\n${YELLOW}Cleaning up existing containers...${NC}"
docker-compose down -v

# Build images
echo -e "\n${YELLOW}Building Docker images...${NC}"
docker-compose build || {
    echo -e "${RED}Failed to build Docker images${NC}"
    exit 1
}

# Start services
echo -e "\n${YELLOW}Starting services...${NC}"
docker-compose up -d || {
    echo -e "${RED}Failed to start services${NC}"
    exit 1
}

# Wait for services to be ready
echo -e "\n${YELLOW}Waiting for services to be ready...${NC}"
sleep 30

# Run validation tests
echo -e "\n${YELLOW}Running validation tests...${NC}"
npm run test:docker

# Check test results
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}All validation tests passed!${NC}"
else
    echo -e "\n${RED}Some validation tests failed. Check logs for details.${NC}"
    
    # Collect logs
    echo -e "\n${YELLOW}Collecting container logs...${NC}"
    mkdir -p logs
    docker-compose logs > logs/docker-validation.log
    
    # Show resource usage
    echo -e "\n${YELLOW}Container resource usage:${NC}"
    docker stats --no-stream
fi

# Cleanup
echo -e "\n${YELLOW}Cleaning up...${NC}"
docker-compose down -v

exit ${TEST_EXIT_CODE:-0} 