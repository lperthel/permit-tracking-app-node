#!/bin/bash

# ------------------------------------------------------------------------------
# Spring Boot runner script for permit-api
# Uses local Maven Wrapper and env vars for DB credentials.
# ------------------------------------------------------------------------------

# Fail fast if something breaks
set -e

# Optional: check that required env vars are set
: "${PERMIT_DB_USER:?Need to set PERMIT_DB_USER}"
: "${PERMIT_DB_PASS:?Need to set PERMIT_DB_PASS}"

echo "Starting permit-api with DB user '$PERMIT_DB_USER'..."

# Clean build and run
./mvnw spring-boot:run -Dspring-boot.run.arguments="--logging.level.root=DEBUG"  2>&1 | tee logs/permit-api.log
