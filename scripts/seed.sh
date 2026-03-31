#!/usr/bin/env bash
set -euo pipefail

# Get script directory to work from project root
# cd "$(dirname "$0")/../server"
PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$PROJECT_ROOT/server"

echo "-------------------------------------------------------"
echo "[Seed] Running BookSmart seed (idempotent)..."
echo "-------------------------------------------------------"

# Check if .env exists
if [ ! -f .env ]; then
    echo "[Error] No .env file found in server directory. Seeding aborted."
    exit 1
fi

# Run seeding utility using Node.js
# This assumes data/seedData.js uses upsert logic
node -e "require('dotenv').config(); require('./seedData.js')"

echo "-------------------------------------------------------"
echo "[Seed] Done! Check server logs for details."
echo "-------------------------------------------------------"
