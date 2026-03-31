#!/bin/bash
# ============================================================
# Haven Medical - Install Dependencies
# ============================================================
# Clean install of all project dependencies
# Usage: ./scripts/install.sh [--clean]
# ============================================================

set -e

cd "$(dirname "$0")/.."

echo "🏥 Haven Medical — Installing Dependencies"
echo ""

if [ "$1" = "--clean" ]; then
  echo "🧹 Cleaning node_modules..."
  rm -rf node_modules
  rm -f package-lock.json
  echo "📦 Fresh install..."
  npm install
else
  echo "📦 Installing..."
  npm install
fi

echo ""
echo "✅ Dependencies installed!"
