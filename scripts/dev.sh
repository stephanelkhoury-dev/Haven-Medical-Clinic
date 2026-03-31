#!/bin/bash
# ============================================================
# Haven Medical - Development Server
# ============================================================
# Starts the Next.js development server with Turbopack
# Usage: ./scripts/dev.sh [port]
# ============================================================

set -e

PORT=${1:-3000}

echo "🏥 Haven Medical — Starting Development Server..."
echo "   Port: $PORT"
echo "   URL:  http://localhost:$PORT"
echo ""

cd "$(dirname "$0")/.."

# Check dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

npx next dev --port "$PORT"
