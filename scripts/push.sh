#!/bin/bash
# ============================================================
# Haven Medical - Git Push
# ============================================================
# Stage, commit, and push changes to GitHub
# Usage: ./scripts/push.sh "commit message"
# ============================================================

set -e

cd "$(dirname "$0")/.."

MESSAGE=${1:-"Update Haven Medical website"}

echo "🏥 Haven Medical — Git Push"
echo ""

# Show status
echo "📋 Changed files:"
git status --short
echo ""

# Stage all
git add -A

# Commit
echo "💾 Committing: $MESSAGE"
git commit -m "$MESSAGE"

# Push
echo "🚀 Pushing to origin..."
git push origin main

echo ""
echo "✅ Pushed to GitHub!"
echo "   Repo: $(git remote get-url origin)"
