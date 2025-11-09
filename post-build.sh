#!/bin/bash
set -euo pipefail

# Post-build script: Copy built assets to server/public for VPS deployment
# This ensures CSS/JS files are in the correct location for production

echo "📦 Syncing built assets from dist/public to server/public..."

# Create server/public if it doesn't exist
mkdir -p server/public

# Use rsync to sync files and delete stale assets (prevents old CSS/JS caching issues)
if command -v rsync &> /dev/null; then
  rsync -a --delete dist/public/ server/public/
  echo "✅ Assets synced successfully with rsync!"
else
  # Fallback to cp if rsync not available
  echo "⚠️  rsync not found, using cp (may leave stale files)"
  rm -rf server/public/*
  cp -r dist/public/. server/public/
  echo "✅ Assets copied successfully with cp!"
fi

echo "   dist/public → server/public"
echo "   $(ls -1 server/public | wc -l) files synced"
