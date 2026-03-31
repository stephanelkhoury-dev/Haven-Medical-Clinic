#!/bin/bash
# ============================================================
# Haven Medical - Deploy to Vercel
# ============================================================
# Deploys the project to Vercel (production or preview)
# Usage: ./scripts/deploy.sh [--prod]
# ============================================================

set -e

cd "$(dirname "$0")/.."

echo "🏥 Haven Medical — Vercel Deployment"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "📦 Installing Vercel CLI..."
  npm install -g vercel
fi

if [ "$1" = "--prod" ]; then
  echo "🚀 Deploying to PRODUCTION..."
  vercel --prod
else
  echo "🔍 Deploying PREVIEW..."
  vercel
fi

echo ""
echo "✅ Deployment complete!"
