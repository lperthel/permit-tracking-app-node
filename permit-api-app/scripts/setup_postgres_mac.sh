#!/bin/bash
# ==============================================
# Setup PostgreSQL locally on macOS
# - Uses .env file for credentials
# - Installs PostgreSQL via Homebrew if missing
# - Handles Launchd issues on macOS Sequoia
# - Creates default permit-tracking DB and user
# ==============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PG_VERSION="14"
ENV_FILE="$PROJECT_ROOT/.env"
ENV_EXAMPLE_FILE="$PROJECT_ROOT/.env.example"

# --- Step 0: Load .env file ---
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ No .env file found in project root: $ENV_FILE"
    if [ -f "$ENV_EXAMPLE_FILE" ]; then
        echo "ℹ️ You can create it by running:"
        echo "    cp .env.example .env"
        echo "Then update the values for PERMIT_DB_NAME, PERMIT_DB_USER, and PERMIT_DB_PASS."
    else
        echo "ℹ️ Please create a .env file with these variables:"
        echo "    PERMIT_DB_NAME=your_database"
        echo "    PERMIT_DB_USER=your_username"
        echo "    PERMIT_DB_PASS=your_password"
        echo "    PERMIT_DB_HOST=localhost"
        echo "    PERMIT_DB_PORT=5432"
    fi
    exit 1
fi

# Export vars from .env
export $(grep -v '^#' "$ENV_FILE" | xargs)

DB_NAME="$PERMIT_DB_NAME"
DB_USER="$PERMIT_DB_USER"
DB_PASS="$PERMIT_DB_PASS"

echo "🔹 Loaded DB config from .env:"
echo "    DB_NAME=$DB_NAME"
echo "    DB_USER=$DB_USER"
echo "    DB_HOST=$PERMIT_DB_HOST"
echo "    DB_PORT=$PERMIT_DB_PORT"

# --- Step 1: Check for Homebrew ---
echo "🔹 Checking for Homebrew..."
if ! command -v brew &> /dev/null; then
    echo "⚠️ Homebrew not found. Installing..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# --- Step 2: Install PostgreSQL if missing ---
if ! brew list | grep -q "postgresql@$PG_VERSION"; then
    echo "⚠️ PostgreSQL $PG_VERSION not found. Installing..."
    brew install "postgresql@$PG_VERSION"
fi

# --- Step 3: Start PostgreSQL with fallback ---
echo "🔹 Starting PostgreSQL service..."
if ! brew services start "postgresql@$PG_VERSION"; then
    echo "⚠️ brew services failed, starting PostgreSQL manually..."
    /opt/homebrew/opt/postgresql@$PG_VERSION/bin/pg_ctl -D /opt/homebrew/var/postgresql@$PG_VERSION start
    sleep 2
fi

# --- Step 4: Create DB user and database ---
echo "🔹 Creating user and database using credentials from .env..."

if ! psql postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    echo "Creating role $DB_USER..."
    psql postgres -c "CREATE ROLE $DB_USER WITH LOGIN SUPERUSER PASSWORD '$DB_PASS';"
else
    echo "Role $DB_USER already exists."
fi

if ! PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "Creating database $DB_NAME..."
    PGPASSWORD="$DB_PASS" createdb -U "$DB_USER" "$DB_NAME"
else
    echo "Database $DB_NAME already exists."
fi

echo "🎉 PostgreSQL setup complete!"
echo "To connect, run:"
echo "    PGPASSWORD=\"YOURPASSWORD\" psql -U $DB_USER -d $DB_NAME"
