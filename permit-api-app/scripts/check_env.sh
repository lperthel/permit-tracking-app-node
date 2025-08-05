#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# check_env.sh
# Purpose: Verify that the .env file (in project root) is loaded correctly
# Usage: Run from the project root as: ./scripts/check_env.sh
# ---------------------------------------------------------------------------

set -e

# Get the project root relative to this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"

# Load the .env file if it exists
if [ -f "$ENV_FILE" ]; then
    # shellcheck source=/dev/null
    source "$ENV_FILE"
    echo "✅ Loaded .env file from $ENV_FILE"
else
    echo "❌ .env file not found in project root."
    echo "Please rename .env.example to .env and configure your variables."
    exit 1
fi

# List of required variables
REQUIRED_VARS=(
    PERMIT_DB_NAME
    PERMIT_DB_USER
    PERMIT_DB_PASS
    PERMIT_DB_HOST
    PERMIT_DB_PORT
)

echo
echo "🔍 Checking required environment variables..."

MISSING=false

for VAR in "${REQUIRED_VARS[@]}"; do
    VALUE="${!VAR}"

    if [ -z "$VALUE" ]; then
        echo "❌ $VAR is NOT set"
        MISSING=true
    else
        # Mask password for security
        if [ "$VAR" = "PERMIT_DB_PASS" ]; then
            echo "✅ $VAR is set (hidden)"
        else
            echo "✅ $VAR = $VALUE"
        fi
    fi
done

echo
if [ "$MISSING" = true ]; then
    echo "⚠️  Some required variables are missing. Please update your .env file."
    exit 1
else
    echo "🎉 All required environment variables are set correctly!"
fi
