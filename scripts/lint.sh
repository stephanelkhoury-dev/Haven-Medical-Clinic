#!/bin/bash
# ============================================================
# Haven Medical - Lint & Type Check
# ============================================================
# Runs ESLint and TypeScript type checking
# Usage: ./scripts/lint.sh [--fix]
# ============================================================

set -e

cd "$(dirname "$0")/.."

echo "🏥 Haven Medical — Code Quality Checks"
echo ""

# TypeScript type check
echo "📝 TypeScript type checking..."
npx tsc --noEmit
echo "   ✅ No type errors"
echo ""

# ESLint
if [ "$1" = "--fix" ]; then
  echo "🔍 ESLint (auto-fix)..."
  npx eslint --fix .
else
  echo "🔍 ESLint..."
  npx eslint .
fi

echo ""
echo "✅ All checks passed!"
