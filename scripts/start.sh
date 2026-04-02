#!/bin/bash
# ============================================================
# Haven Medical - Production Server
# ============================================================
# Starts the Next.js production server (requires build first)
# Usage: ./scripts/start.sh [port]
# ============================================================

set -e

PORT=${1:-3030}

cd "$(dirname "$0")/.."

if [ ! -d ".next" ]; then
  echo "⚠️  No build found. Building first..."
  npm run build
fi

echo "🏥 Haven Medical — Production Server"
echo "   Port: $PORT"
echo "   URL:  http://localhost:$PORT"
echo ""

npx next start --port "$PORT"
