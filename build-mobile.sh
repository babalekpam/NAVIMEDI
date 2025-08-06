#!/bin/bash

# Carnet Mobile App Build Script
# This script builds the Carnet patient app for both iOS and Android

echo "🏗️  Building Carnet Mobile App for iOS and Android..."

# Build the web app first
echo "📦 Building web application..."
npm run build

# Check if build was successful
if [ ! -d "dist/public" ]; then
    echo "❌ Web build failed - dist/public directory not found"
    exit 1
fi

# Sync the web build to Capacitor platforms
echo "🔄 Syncing web app to mobile platforms..."
npx cap sync

# Add iOS platform if not exists
if [ ! -d "ios" ]; then
    echo "🍎 Adding iOS platform..."
    npx cap add ios
fi

# Add Android platform if not exists  
if [ ! -d "android" ]; then
    echo "🤖 Adding Android platform..."
    npx cap add android
fi

# Build iOS app (requires macOS and Xcode)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Building iOS app..."
    npx cap build ios --release
    echo "✅ iOS build complete - open ios/App/App.xcworkspace in Xcode to sign and deploy"
else
    echo "⚠️  iOS build skipped (requires macOS)"
    echo "📝 To build for iOS: run this script on macOS with Xcode installed"
fi

# Build Android APK
echo "🤖 Building Android APK..."
npx cap build android --release

echo "🎉 Mobile app build process complete!"
echo ""
echo "📱 Next steps:"
echo "   • iOS: Open ios/App/App.xcworkspace in Xcode, sign with Apple Developer account, and submit to App Store"
echo "   • Android: Upload android/app/build/outputs/apk/release/app-release.apk to Google Play Console"
echo ""
echo "🔐 App Store Requirements:"
echo "   • iOS: Apple Developer Program membership ($99/year)"
echo "   • Android: Google Play Developer account ($25 one-time fee)"
echo ""
echo "📋 App Store Listings:"
echo "   • App ID: com.navimed.carnet"
echo "   • App Name: Carnet - Private Health App"
echo "   • Category: Health & Fitness / Medical"
echo "   • Privacy: Requires user authentication, handles sensitive health data"