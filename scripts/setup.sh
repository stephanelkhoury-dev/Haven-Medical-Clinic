#!/bin/bash
# ============================================================
# Haven Medical - Full Setup
# ============================================================
# Complete project setup: install deps, generate placeholders,
# build, and verify everything works
# Usage: ./scripts/setup.sh
# ============================================================

set -e

cd "$(dirname "$0")/.."

echo "=============================================="
echo "  🏥 Haven Medical — Full Project Setup"
echo "=============================================="
echo ""

# Step 1: Install dependencies
echo "📦 Step 1/4 — Installing dependencies..."
npm install
echo ""

# Step 2: Generate placeholder images
echo "🖼️  Step 2/4 — Generating placeholder images..."
bash scripts/generate-placeholders.sh
echo ""

# Step 3: Build
echo "🔨 Step 3/4 — Building for production..."
npm run build
echo ""

# Step 4: Summary
echo "=============================================="
echo "  ✅ Setup Complete!"
echo "=============================================="
echo ""
echo "  Commands:"
echo "    npm run dev       — Start dev server"
echo "    npm run build     — Production build"
echo "    npm start         — Serve production build"
echo ""
echo "  Scripts:"
echo "    ./scripts/dev.sh          — Dev server"
echo "    ./scripts/build.sh        — Build with lint"
echo "    ./scripts/deploy.sh       — Deploy to Vercel"
echo "    ./scripts/push.sh \"msg\"   — Git commit & push"
echo "    ./scripts/lint.sh         — Type check + lint"
echo ""
echo "  Admin Dashboard:"
echo "    URL:      http://localhost:3000/admin"
echo "    Username: admin"
echo "    Password: Haven2024!"
echo ""
