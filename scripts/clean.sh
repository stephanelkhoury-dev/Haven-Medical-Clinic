#!/bin/bash
# ============================================================
# Haven Medical - Clean Project
# ============================================================
# Removes build artifacts, caches, and optionally node_modules
# Usage: ./scripts/clean.sh [--all]
# ============================================================

set -e

cd "$(dirname "$0")/.."

echo "🏥 Haven Medical — Clean"
echo ""

echo "🧹 Removing .next build cache..."
rm -rf .next

echo "🧹 Removing TypeScript build info..."
rm -f tsconfig.tsbuildinfo *.tsbuildinfo

echo "🧹 Removing Next.js cache..."
rm -rf .next/cache

if [ "$1" = "--all" ]; then
  echo "🧹 Removing node_modules..."
  rm -rf node_modules
  echo "🧹 Removing package-lock.json..."
  rm -f package-lock.json
fi

echo ""
echo "✅ Clean complete!"
