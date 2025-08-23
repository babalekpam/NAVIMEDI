#!/bin/bash
set -e

echo "🏗️  Building NaviMED Healthcare Platform..."

# Build client (frontend)
echo "📦 Building client..."
vite build

# Build server (backend) 
echo "🔧 Building server..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js

echo "✅ Build completed successfully!"
echo "📁 Built files:"
ls -la dist/
echo "🌐 Frontend assets:"
ls -la dist/public/