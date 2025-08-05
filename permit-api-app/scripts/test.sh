#!/bin/bash
# ==============================================
# Verify Project Build & Tests
# - Loads environment variables from .env
# - Runs Maven verify from project root
# - Logs output to timestamped file in logs/
# ==============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$PROJECT_ROOT/logs"
ENV_FILE="$PROJECT_ROOT/.env"
MVNW="$PROJECT_ROOT/mvnw"

# --- Step 0: Check for .env ---
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ No .env file found in project root: $ENV_FILE"
    echo "ℹ️ Please copy .env.example to .env and configure your database credentials first:"
    echo "    cp .env.example .env"
    exit 1
fi

# Load environment variables (without printing sensitive info)
export $(grep -v '^#' "$ENV_FILE" | xargs)

echo "🔹 Environment variables loaded from .env (DB password hidden)."

# --- Step 1: Prepare logs ---
mkdir -p "$LOG_DIR"
timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
log_file="$LOG_DIR/test-$timestamp.log"

# --- Step 2: Verify Maven Wrapper exists ---
if [ ! -f "$MVNW" ]; then
    echo "❌ mvnw not found at $MVNW"
    echo "ℹ️ Run 'mvn -N io.takari:maven:wrapper' in the project root to regenerate the Maven wrapper."
    exit 1
fi

# --- Step 3: Run Maven tests from project root ---
echo "🔹 Running tests... (log: $log_file)"
(
  cd "$PROJECT_ROOT"
  "$MVNW" clean test -X -Ddependency-check.skip=true 2>&1 | tee "$log_file"
)

echo "🎉 Verify script completed. Logs saved to $log_file"
