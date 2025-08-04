#!/bin/bash
# ==============================================
# Install Maven on macOS (via Homebrew)
# Ensures Homebrew exists, installs Maven if missing,
# and verifies installation.
# ==============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🔹 Project root detected at: $PROJECT_ROOT"

echo "🔹 Checking for Homebrew..."
if ! command -v brew &> /dev/null
then
    echo "⚠️ Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    echo "✅ Homebrew installed."
else
    echo "✅ Homebrew is already installed."
fi

echo "🔹 Checking for Maven..."
if ! command -v mvn &> /dev/null
then
    echo "⚠️ Maven not found. Installing Maven..."
    brew install maven
    echo "✅ Maven installed."
else
    echo "✅ Maven is already installed."
fi

echo "🔹 Verifying Maven installation..."
mvn -v

echo "🎉 Maven setup complete!"
