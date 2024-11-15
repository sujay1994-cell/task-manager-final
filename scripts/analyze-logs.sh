#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Directory containing logs
LOG_DIR="./backend/logs"

echo -e "${YELLOW}Analyzing application logs...${NC}"

# Count errors by type
echo -e "\n${GREEN}Error Types Summary:${NC}"
grep -r "type\":" $LOG_DIR | sort | uniq -c | sort -nr

# Find most frequent errors
echo -e "\n${GREEN}Most Frequent Errors:${NC}"
grep -r "error" $LOG_DIR | sort | uniq -c | sort -nr | head -n 10

# Check for database connection issues
echo -e "\n${GREEN}Database Connection Issues:${NC}"
grep -r "DatabaseError" $LOG_DIR | wc -l

# Check for authentication failures
echo -e "\n${GREEN}Authentication Failures:${NC}"
grep -r "AuthenticationError" $LOG_DIR | wc -l

# Check for API errors
echo -e "\n${GREEN}API Errors:${NC}"
grep -r "NetworkError" $LOG_DIR | wc -l

# Show recent errors
echo -e "\n${GREEN}Recent Errors (last 10):${NC}"
tail -n 10 $LOG_DIR/error-*.log

# Generate error report
echo -e "\n${GREEN}Generating error report...${NC}"
ERROR_REPORT="error_report_$(date +%Y%m%d).txt"

{
  echo "Error Report - $(date)"
  echo "===================="
  echo
  echo "Error Types:"
  grep -r "type\":" $LOG_DIR | sort | uniq -c | sort -nr
  echo
  echo "Most Common Errors:"
  grep -r "error" $LOG_DIR | sort | uniq -c | sort -nr | head -n 10
} > $ERROR_REPORT

echo -e "${GREEN}Report generated: $ERROR_REPORT${NC}" 