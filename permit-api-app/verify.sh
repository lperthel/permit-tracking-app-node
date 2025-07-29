#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p logs

# Create timestamp
timestamp=$(date +"%Y-%m-%d_%H-%M-%S")

# Run tests and tee output to timestamped log file
log_file="logs/test-$timestamp.log"
echo "Running tests... (log: $log_file)"
# ./mvnw org.owasp:dependency-check-maven:check -Dnvd.api.key=174fe216-8f7d-41bc-922f-463a4ecb021d -X 2>&1 | tee "$log_file"
./mvnw clean verify -X 2>&1 -Ddependency-check.skip=true | tee "$log_file"
# ./mvnw clean verify -X 2>&1 | tee "$log_file"
