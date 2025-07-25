#!/bin/bash

# ------------------------------------------------------------------------------
# Spring Boot runner script for permit-api
# Uses local Maven Wrapper and env vars for DB credentials.
# ------------------------------------------------------------------------------

# Fail fast if something breaks
set -e

# Optional: check that required env vars are set
: "${DB_USERNAME:?Need to set DB_USERNAME}"
: "${DB_PASSWORD:?Need to set DB_PASSWORD}"

echo "Starting permit-api with DB user '$DB_USERNAME'..."

# Clean build and run
./mvnw spring-boot:run -Dspring-boot.run.arguments="--logging.level.root=DEBUG"  2>&1 | tee logs/permit-api.log
