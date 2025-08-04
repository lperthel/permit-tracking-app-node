#!/bin/bash
# ==============================================
# Uninstall PostgreSQL (Homebrew) on macOS
# - Stops PostgreSQL service
# - Uninstalls PostgreSQL via Homebrew
# - Deletes all data directories and logs
# - Cleans up LaunchAgents for a fresh install
# ==============================================

set -e

PG_VERSION="14"
PG_PREFIX="/opt/homebrew" # Apple Silicon default
PG_DATA_DIR="$PG_PREFIX/var/postgresql@$PG_VERSION"
PG_LOG_FILE="$HOME/Library/Logs/Homebrew/postgresql@$PG_VERSION.log"
LAUNCH_AGENT="$HOME/Library/LaunchAgents/homebrew.mxcl.postgresql@$PG_VERSION.plist"

echo "⚠️ WARNING: This will completely remove PostgreSQL $PG_VERSION and all data."
read -p "Type 'YES' to continue: " CONFIRM
if [ "$CONFIRM" != "YES" ]; then
    echo "❌ Aborted."
    exit 1
fi

# --- Step 1: Stop service if running ---
echo "🔹 Stopping PostgreSQL service..."
brew services stop "postgresql@$PG_VERSION" || true

# --- Step 2: Remove LaunchAgent if exists ---
if [ -f "$LAUNCH_AGENT" ]; then
    echo "🔹 Removing LaunchAgent..."
    rm -f "$LAUNCH_AGENT"
fi

# --- Step 3: Uninstall PostgreSQL via Homebrew ---
if brew list | grep -q "postgresql@$PG_VERSION"; then
    echo "🔹 Uninstalling PostgreSQL $PG_VERSION..."
    brew uninstall --force "postgresql@$PG_VERSION"
else
    echo "ℹ️ PostgreSQL $PG_VERSION is not installed via Homebrew."
fi

# --- Step 4: Remove Data Directory and Logs ---
if [ -d "$PG_DATA_DIR" ]; then
    echo "🔹 Removing PostgreSQL data directory..."
    rm -rf "$PG_DATA_DIR"
else
    echo "ℹ️ No data directory found at $PG_DATA_DIR"
fi

if [ -f "$PG_LOG_FILE" ]; then
    echo "🔹 Removing PostgreSQL log file..."
    rm -f "$PG_LOG_FILE"
fi

# --- Step 5: Cleanup Brew services ---
brew services cleanup

echo "🎉 PostgreSQL $PG_VERSION fully removed!"
echo "You can now run ./scripts/setup_postgres_mac.sh for a fresh install."
