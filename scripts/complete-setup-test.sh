#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Initialize error counter
ERRORS=0

# Function to print section headers
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Function to check command existence
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}✗ $1 is not installed${NC}"
        echo -e "${YELLOW}Please install $1 first. Refer to docs/setup_guide.md${NC}"
        ERRORS=$((ERRORS + 1))
        return 1
    else
        echo -e "${GREEN}✓ $1 is installed${NC}"
        return 0
    fi
}

# Function to test URL
test_url() {
    local url=$1
    local name=$2
    local max_retries=5
    local retry_count=0

    while [ $retry_count -lt $max_retries ]; do
        if curl -f "$url" &>/dev/null; then
            echo -e "${GREEN}✓ $name is accessible${NC}"
            return 0
        else
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $max_retries ]; then
                echo -e "${YELLOW}Retrying $name connection ($retry_count/$max_retries)...${NC}"
                sleep 5
            fi
        fi
    done
    
    echo -e "${RED}✗ $name is not accessible${NC}"
    ERRORS=$((ERRORS + 1))
    return 1
}

# Start testing
print_header "STARTING COMPLETE SETUP TEST"
echo "This script will verify your entire setup from start to finish."

# Check prerequisites
print_header "CHECKING PREREQUISITES"
check_command docker
check_command docker-compose
check_command git
check_command node

# Check system resources
print_header "CHECKING SYSTEM RESOURCES"
total_memory=$(free -g | awk '/^Mem:/{print $2}')
free_disk=$(df -h / | awk 'NR==2 {print $4}' | sed 's/G//')

if [ $total_memory -lt 4 ]; then
    echo -e "${RED}✗ Insufficient memory (minimum 4GB required)${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ Sufficient memory${NC}"
fi

if [ ${free_disk%.*} -lt 10 ]; then
    echo -e "${RED}✗ Insufficient disk space (minimum 10GB required)${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ Sufficient disk space${NC}"
fi

# Clean up existing containers
print_header "CLEANING UP EXISTING CONTAINERS"
docker-compose down -v &>/dev/null
docker system prune -f &>/dev/null

# Check environment files
print_header "CHECKING ENVIRONMENT FILES"
if [ ! -f .env ]; then
    echo -e "${RED}✗ Main .env file missing${NC}"
    echo -e "${YELLOW}Creating default .env file...${NC}"
    cat > .env << EOL
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/magazine_db
JWT_SECRET=your_jwt_secret_here
EOL
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ Main .env file exists${NC}"
fi

# Build and start services
print_header "BUILDING AND STARTING SERVICES"
echo -e "${YELLOW}Building Docker images (this may take a few minutes)...${NC}"
if docker-compose build --no-cache; then
    echo -e "${GREEN}✓ Docker images built successfully${NC}"
else
    echo -e "${RED}✗ Docker image build failed${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo -e "${YELLOW}Starting services...${NC}"
if docker-compose up -d; then
    echo -e "${GREEN}✓ Services started successfully${NC}"
else
    echo -e "${RED}✗ Services failed to start${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to initialize (30 seconds)...${NC}"
sleep 30

# Test service health
print_header "TESTING SERVICE HEALTH"
test_url "http://localhost:5000/health" "Backend API"
test_url "http://localhost/health" "Frontend"
test_url "http://localhost:5000/api/db-check" "Database connection"

# Test basic functionality
print_header "TESTING BASIC FUNCTIONALITY"

# Test user registration
echo -e "${YELLOW}Testing user registration...${NC}"
register_response=$(curl -s -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test Admin","email":"admin@test.com","password":"admin123","role":"admin","department":"Sales"}')

if echo $register_response | grep -q "token"; then
    echo -e "${GREEN}✓ User registration successful${NC}"
else
    echo -e "${RED}✗ User registration failed${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check logs for errors
print_header "CHECKING SERVICE LOGS"
if docker-compose logs --tail=100 | grep -i "error"; then
    echo -e "${RED}✗ Found errors in logs${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ No errors found in logs${NC}"
fi

# Final status report
print_header "SETUP TEST COMPLETE"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed successfully!${NC}"
    echo -e "\nYou can now access:"
    echo -e "- Frontend: ${BLUE}http://localhost${NC}"
    echo -e "- Backend API: ${BLUE}http://localhost:5000${NC}"
    echo -e "\nDefault admin credentials:"
    echo -e "Email: ${BLUE}admin@test.com${NC}"
    echo -e "Password: ${BLUE}admin123${NC}"
else
    echo -e "${RED}✗ Setup test completed with $ERRORS errors${NC}"
    echo -e "\nPlease check:"
    echo -e "1. Docker logs: ${BLUE}docker-compose logs${NC}"
    echo -e "2. Setup guide: ${BLUE}docs/setup_guide.md${NC}"
    echo -e "3. Troubleshooting guide: ${BLUE}docs/troubleshooting.md${NC}"
fi

# Cleanup on failure
if [ $ERRORS -gt 0 ]; then
    print_header "COLLECTING DIAGNOSTIC INFORMATION"
    mkdir -p logs
    docker-compose logs > logs/setup-test.log
    echo -e "${YELLOW}Logs saved to: logs/setup-test.log${NC}"
fi

exit $ERRORS 