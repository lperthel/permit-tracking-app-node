#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p logs

# Create timestamp
timestamp=$(date +"%Y-%m-%d_%H-%M-%S")

# Run tests and tee output to timestamped log file
log_file="logs/test-$timestamp.log"
echo "Running tests... (log: $log_file)"
./mvnw clean verify 2>&1 | tee "$log_file"
