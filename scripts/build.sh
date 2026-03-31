#!/bin/bash
# ============================================================
# Haven Medical - Production Build
# ============================================================
# Builds the Next.js app for production
# Usage: ./scripts/build.sh
# ============================================================

set -e

cd "$(dirname "$0")/.."

echo "🏥 Haven Medical — Production Build"
echo ""

# Check dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

echo "🔍 Running linter..."
npm run lint 2>&1 || echo "⚠️  Lint warnings detected (non-blocking)"

echo ""
echo "🔨 Building for production..."
npm run build

echo ""
echo "✅ Build complete!"
echo "   Run 'npm start' or './scripts/start.sh' to serve."
