#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Testing logo implementation..."

# Check if the logo files exist
echo "Checking logo files..."

FILES_TO_CHECK=(
    "frontend/public/images/logo/logo.svg"
    "frontend/public/images/logo/logo-150.png"
    "frontend/public/images/logo/logo-300.png"
    "frontend/public/images/logo/logo-favicon.ico"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file is missing"
    fi
done

# Check image dimensions
echo -e "\nChecking image dimensions..."
if command -v identify >/dev/null 2>&1; then
    identify frontend/public/images/logo/logo-150.png
    identify frontend/public/images/logo/logo-300.png
else
    echo "ImageMagick not installed. Skipping dimension check."
fi

# Start development server
echo -e "\nStarting development server..."
cd frontend
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 10

# Run browser tests
echo -e "\nTesting in browser..."
if command -v cypress >/dev/null 2>&1; then
    npx cypress run --spec "cypress/integration/logo.spec.js"
else
    echo "Cypress not installed. Manual testing required."
    echo "Please verify logo appearance at:"
    echo "- Desktop (1920x1080)"
    echo "- Tablet (768x1024)"
    echo "- Mobile (375x667)"
fi

# Cleanup
kill $SERVER_PID 