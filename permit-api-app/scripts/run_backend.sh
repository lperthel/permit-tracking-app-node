#!/bin/bash

# ------------------------------------------------------------------------------
# Spring Boot runner script for permit-api
# Loads .env file, uses local Maven Wrapper, and streams logs to logs/permit-api.log
# ------------------------------------------------------------------------------

set -e  # Exit on any error

# Navigate to project root (parent of scripts/)
cd "$(dirname "$0")/.."

# Load .env file if it exists
if [ -f ".env" ]; then
    echo "Loading environment variables from .env..."
    # Export variables defined in .env, ignoring comments and empty lines
    export $(grep -v '^#' .env | xargs)
else
    echo "Warning: .env file not found. Ensure required env vars are set."
fi

# Check that required env vars exist
: "${PERMIT_DB_USER:?Need to set PERMIT_DB_USER}"
: "${PERMIT_DB_PASS:?Need to set PERMIT_DB_PASS}"

LOG_DIR="logs"
mkdir -p "$LOG_DIR"

echo "Starting permit-api with DB user '$PERMIT_DB_USER'..."

# Run Spring Boot with debug logging and capture output
./mvnw spring-boot:run \
  -Dspring-boot.run.arguments="--logging.level.root=DEBUG" \
  2>&1 | tee "$LOG_DIR/permit-api.log"
