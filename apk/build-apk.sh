#!/bin/bash
# Marketplace APK Build Script
# Run this on a machine with Android Studio installed

set -e  # Exit on error

echo "📱 Marketplace APK Build Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $1 found${NC}"
        return 0
    fi
}

echo ""
echo "🔍 Checking prerequisites..."

check_command node || exit 1
check_command npm || exit 1
check_command npx || exit 1

# Check Android Studio (via gradle)
if [ -d "$ANDROID_HOME" ] || [ -d "$HOME/Library/Android/sdk" ] || [ -d "$HOME/Android/Sdk" ]; then
    echo -e "${GREEN}✅ Android SDK found${NC}"
else
    echo -e "${YELLOW}⚠️  Android SDK not found in standard locations${NC}"
    echo "   Make sure ANDROID_HOME is set or Android Studio is installed"
fi

# Get deployment URL
if [ -z "$CAPACITOR_SERVER_URL" ]; then
    echo ""
    read -p "Enter your deployed Vercel URL (e.g., https://myapp.vercel.app): " DEPLOY_URL
    export CAPACITOR_SERVER_URL=$DEPLOY_URL
fi

echo ""
echo "📦 Using deployment URL: $CAPACITOR_SERVER_URL"

# Update capacitor.config.ts with the URL
echo "🔧 Updating capacitor.config.ts..."
sed -i "s|url: process.env.CAPACITOR_SERVER_URL || 'https://yourdomain.vercel.app'|url: '$CAPACITOR_SERVER_URL'|" capacitor.config.ts

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Sync Capacitor
echo ""
echo "🔄 Syncing Capacitor..."
npx cap sync android

# Open Android Studio
echo ""
echo "🎯 Opening Android Studio..."
echo "   In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)"
npx cap open android

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps in Android Studio:"
echo "  1. Wait for Gradle sync to complete"
echo "  2. Build → Build Bundle(s) / APK(s) → Build APK(s)"
echo "  3. Find APK at: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "For release build:"
echo "  Build → Generate Signed Bundle/APK → APK"
echo "  (Requires keystore for Play Store)"