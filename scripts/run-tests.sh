#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Initialize error flag
ERROR=0

echo -e "${YELLOW}Starting test suite...${NC}"

# Check dependencies
echo -e "\n${YELLOW}Checking dependencies...${NC}"
npm install || {
    echo -e "${RED}Failed to install dependencies${NC}"
    exit 1
}

# Run backend tests
echo -e "\n${YELLOW}Running backend tests...${NC}"
npm run test || {
    echo -e "${RED}Backend tests failed${NC}"
    ERROR=1
}

# Run frontend tests
echo -e "\n${YELLOW}Running frontend tests...${NC}"
npm run test:e2e || {
    echo -e "${RED}Frontend tests failed${NC}"
    ERROR=1
}

# Generate coverage report
echo -e "\n${YELLOW}Generating coverage report...${NC}"
npm run test:coverage

# Check for Docker services
echo -e "\n${YELLOW}Checking Docker services...${NC}"
docker-compose ps || {
    echo -e "${RED}Docker services check failed${NC}"
    ERROR=1
}

# Print test results
if [ $ERROR -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed successfully!${NC}"
else
    echo -e "\n${RED}Some tests failed. Check logs for details.${NC}"
    # Collect logs
    echo -e "\n${YELLOW}Collecting logs...${NC}"
    mkdir -p logs
    docker-compose logs > logs/docker.log
    cp cypress/reports/* logs/
    cp coverage/* logs/
fi

exit $ERROR 