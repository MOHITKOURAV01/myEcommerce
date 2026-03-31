#!/bin/bash
# BookSmart — Local Setup Script
# Usage: bash scripts/setup-local.sh

set -e

echo "════════════════════════════════════"
echo "  BookSmart — Local Development Setup"
echo "════════════════════════════════════"

# Server setup
echo "📦 Setting up server..."
cd "$(dirname "$0")/../server"
if [ ! -f .env ]; then
  cp .env.example .env
  echo "   Created .env from .env.example"
fi
npm install
echo "   ✅ Server dependencies installed"

# Client setup
echo "🎨 Setting up client..."
cd ../client
if [ ! -f .env ]; then
  cp .env.example .env
  echo "   Created .env from .env.example"
fi
npm install
echo "   ✅ Client dependencies installed"

echo ""
echo "════════════════════════════════════"
echo "  Setup Complete! 🎉"
echo ""
echo "  Start MongoDB:  mongod"
echo "  Start Server:   cd server && npm run dev"
echo "  Start Client:   cd client && npm run dev"
echo "════════════════════════════════════"
