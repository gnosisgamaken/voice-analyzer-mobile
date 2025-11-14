#!/bin/bash

# Voice Analyzer - Mac Setup Script
# Run this after cloning the project to your Mac

set -e

echo "🚀 Setting up Voice Analyzer on your Mac..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the voice-analyzer-mobile directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing Node dependencies..."
npm install

# Generate iOS native project
echo "🍎 Generating iOS project for Xcode..."
npx expo prebuild --platform ios --clean

# Install CocoaPods
echo "☕ Installing iOS dependencies (CocoaPods)..."
cd ios
pod install
cd ..

echo ""
echo "✅ Setup complete! Next steps:"
echo ""
echo "1. Open in Xcode:"
echo "   open ios/voiceanalyzermobile.xcworkspace"
echo ""
echo "2. In Xcode:"
echo "   - Select your team (Apple ID) in Signing & Capabilities"
echo "   - Change Bundle Identifier to something unique"
echo "   - Choose a simulator or your iPhone"
echo "   - Press the Play button (▶️)"
echo ""
echo "3. Or use Expo CLI:"
echo "   npx expo start"
echo "   Press 'i' for iOS Simulator"
echo ""
echo "Happy coding! 🎉"
