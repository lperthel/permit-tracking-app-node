#!/bin/bash
set -e

# Create logs directory if it doesn't exist
mkdir -p logs

# Create timestamp
timestamp=$(date +"%Y-%m-%d_%H-%M-%S")

# Run tests and tee output to timestamped log file
log_file="logs/test-$timestamp.log"
echo "Running tests... (log: $log_file)"

echo "=== Cleaning and running all tests ==="
./mvnw clean verify -X -Ddependency-check.skip=true 2>&1 | tee "$log_file"

echo "=== Merging JaCoCo coverage files ==="
exec_files=$(find . -maxdepth 4 -name "jacoco.exec")

if [ -z "$exec_files" ]; then
    echo "No JaCoCo exec files found. Skipping merge and report."
    exit 0
fi

exec_files_csv=$(echo "$exec_files" | tr '\n' ',' | sed 's/,$//')

# If more than one exec file exists, merge them
if [ $(echo "$exec_files" | wc -l) -gt 1 ]; then
    ./mvnw jacoco:merge -X \
        -Djacoco.destFile=target/jacoco-merged.exec \
        -Djacoco.dataFiles="$exec_files_csv"
    data_file="target/jacoco-merged.exec"
else
    echo "Only one exec file found. Using it directly."
    data_file="$exec_files"
fi

echo "=== Generating JaCoCo HTML report ==="
./mvnw jacoco:report -Djacoco.dataFile="$data_file"

REPORT="target/site/jacoco/index.html"
if [ -f "$REPORT" ]; then
    echo "=== Opening report in Firefox ==="
    firefox "$REPORT" &
else
    echo "Report not found: $REPORT"
    exit 1
fi
