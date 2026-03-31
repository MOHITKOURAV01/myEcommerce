#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/ubuntu/booksmart"
WEB_DIR="/var/www/booksmart"
LOG_DIR="$APP_DIR/logs"

echo "-------------------------------------------------------"
echo "[BookSmart] Starting idempotent deployment... $(date)"
echo "-------------------------------------------------------"

# Ensure directories exist
mkdir -p "$LOG_DIR"
sudo mkdir -p "$WEB_DIR"
sudo chown -R ubuntu:ubuntu "$WEB_DIR"

# 1. Pull latest code
echo "[Deploy] Updating source code from main branch..."
cd "$APP_DIR"
git fetch --all
git reset --hard origin/main

# 2. Server Dependencies (npm ci is idempotent)
echo "[Deploy] Installing server dependencies (production)..."
cd "$APP_DIR/server"
npm ci --only=production

# 3. Build Client
echo "[Deploy] Building client application..."
cd "$APP_DIR/client"
npm ci
npm run build

# 4. Sync build to Web Directory
echo "[Deploy] Synchronizing client build to /var/www/..."
sudo cp -rf "$APP_DIR/client/dist/." "$WEB_DIR/"

# 5. Nginx: test then reload
echo "[Deploy] Reloading Nginx configuration..."
sudo nginx -t && sudo systemctl reload nginx

# 6. PM2: restart or start
echo "[Deploy] Managing PM2 process (booksmart-api)..."
cd "$APP_DIR/server"
# Check if already running then restart, otherwise start
if pm2 show booksmart-api > /dev/null 2>&1; then
    pm2 restart booksmart-api --update-env
else
    pm2 start server.js --name booksmart-api --log "$LOG_DIR/app.log"
fi
pm2 save

echo "-------------------------------------------------------"
echo "[BookSmart] Deployment complete! Ready for traffic."
echo "-------------------------------------------------------"
