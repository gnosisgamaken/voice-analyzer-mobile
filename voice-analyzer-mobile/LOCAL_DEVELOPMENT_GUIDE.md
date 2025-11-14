# Local Development Guide - MacBook Setup

## Overview

This guide shows you how to sync your Voice Analyzer project from Replit to your MacBook and test it **completely free** without a paid Apple Developer account.

---

## Part 1: Sync Replit Project to Your Mac

### Option A: Git Clone (Recommended)

**Step 1: Initialize Git in Replit (if not already done)**

In the Replit Shell, run:
```bash
cd /home/runner/workspace
git init
git add .
git commit -m "Initial commit"
```

**Step 2: Connect to GitHub**

1. Create a new repository on GitHub (e.g., `voice-analyzer-mobile`)
2. In Replit Shell:
```bash
git remote add origin https://github.com/YOUR_USERNAME/voice-analyzer-mobile.git
git branch -M main
git push -u origin main
```

**Step 3: Clone to Your Mac**

Open Terminal on your Mac:
```bash
cd ~/Developer  # or wherever you keep projects
git clone https://github.com/YOUR_USERNAME/voice-analyzer-mobile.git
cd voice-analyzer-mobile
```

### Option B: Download as ZIP

1. In Replit, use the Shell to create a zip:
   ```bash
   cd /home/runner/workspace
   zip -r project.zip voice-analyzer-mobile
   ```
2. Download the zip file
3. Extract on your Mac

---

## Part 2: Set Up Local Development Environment

### Prerequisites

**Install Required Tools:**

1. **Node.js** (v20 or later)
   ```bash
   # Check if installed:
   node --version
   
   # If not, install via Homebrew:
   brew install node
   ```

2. **Watchman** (for React Native file watching)
   ```bash
   brew install watchman
   ```

3. **Xcode** (from Mac App Store - **FREE**, ~15 GB download)
   - Open Xcode after installation
   - Accept license agreement
   - Install additional components when prompted

4. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

5. **CocoaPods** (iOS dependency manager)
   ```bash
   sudo gem install cocoapods
   ```

### Install Project Dependencies

In your project directory:
```bash
cd voice-analyzer-mobile

# Install Node modules
npm install

# Install iOS dependencies
cd ios
pod install
cd ..
```

---

## Part 3: Testing Options (Both 100% FREE!)

### Option 1: iOS Simulator (No iPhone Required)

**Best for:** Quick UI testing, debugging, development iteration

**Pros:**
- ✅ Completely free
- ✅ No Apple account needed
- ✅ Instant hot-reload
- ✅ Easy debugging with React DevTools

**Cons:**
- ❌ No camera, microphone, or real sensors
- ❌ Slower performance than real device

**How to Use:**

1. **Start the Metro bundler:**
   ```bash
   npx expo start
   ```

2. **Press `i` to open in iOS Simulator**
   - Simulator will launch automatically
   - App will install and run

**Note:** Audio recording won't work in the simulator (no microphone), but you can test all UI/UX, navigation, and visual features.

---

### Option 2: Your iPhone with FREE Apple ID

**Best for:** Real audio testing, sensor testing, performance validation

**Pros:**
- ✅ Real microphone and sensors
- ✅ Accurate performance testing
- ✅ FREE Apple ID (no $99/year account needed)

**Cons:**
- ⚠️ App expires after 7 days (must rebuild)
- ⚠️ Limited to 3 apps at a time on device
- ⚠️ Must rebuild via USB (can't distribute)

**Setup Steps:**

**Step 1: Generate Native iOS Project**

Your project currently uses Expo managed workflow. To build with Xcode, you need to generate the native iOS folder:

```bash
npx expo prebuild --platform ios
```

This creates an `ios/` folder with Xcode project files.

**Step 2: Install Pods**

```bash
cd ios
pod install
cd ..
```

**Step 3: Open in Xcode**

```bash
open ios/voiceanalyzermobile.xcworkspace
```

**Important:** Always open the `.xcworkspace` file, not `.xcodeproj`

**Step 4: Configure Signing**

In Xcode:
1. Click on your project name in the left sidebar
2. Select your target (voiceanalyzermobile)
3. Go to "Signing & Capabilities" tab
4. Check "Automatically manage signing"
5. Select your **Team** (use your FREE Apple ID)
   - If not logged in: Xcode > Settings > Accounts > Add (+) > Sign in with your Apple ID
6. Change "Bundle Identifier" to something unique (e.g., `com.yourname.voiceanalyzer`)

**Step 5: Connect Your iPhone**

1. Connect iPhone to Mac via USB cable
2. Trust the Mac on your iPhone when prompted
3. In Xcode, select your iPhone from the device dropdown (top toolbar)

**Step 6: Build and Run**

1. Click the Play button (▶️) in Xcode toolbar, or press `Cmd + R`
2. Wait for the build to complete (~2-5 minutes first time)
3. On your iPhone: Settings > General > VPN & Device Management
4. Trust the developer certificate for your Apple ID
5. App will launch on your iPhone!

**Step 7: Enable Hot Reload (Optional)**

Once installed, you can use Expo's development server for faster iteration:

1. In Terminal (not Xcode):
   ```bash
   npx expo start --dev-client
   ```

2. Shake your iPhone to open the Expo menu
3. Changes will hot-reload automatically

---

## Part 4: Development Workflow

### Recommended Approach

**For UI/UX Development:**
→ Use **iOS Simulator** (instant testing, fast iteration)

**For Audio Testing:**
→ Use **Your iPhone + FREE Apple ID** (rebuild every 7 days)

**For Production:**
→ Upgrade to paid Apple Developer account ($99/year) when ready to distribute

### Sync Workflow (Replit ↔ Mac)

**After making changes on Replit:**
```bash
# In Replit Shell
git add .
git commit -m "Updated feature X"
git push
```

**Pull changes to your Mac:**
```bash
# On your Mac
git pull
npm install  # if package.json changed
cd ios && pod install && cd ..  # if native dependencies changed
```

---

## Part 5: Troubleshooting

### Common Issues

**"No devices found"**
- Make sure iPhone is unlocked and connected via USB
- Select your device from Xcode's device dropdown

**"Untrusted Developer"**
- Go to Settings > General > VPN & Device Management
- Tap your Apple ID under Developer App
- Tap "Trust"

**Build Errors**
- Clean build: Xcode > Product > Clean Build Folder (Cmd + Shift + K)
- Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`
- Reinstall pods: `cd ios && pod deintegrate && pod install`

**Metro Bundler Issues**
- Clear cache: `npx expo start --clear`
- Reset Metro: `watchman watch-del-all`

**App Expired (after 7 days)**
- Simply rebuild and reinstall via Xcode
- Your data will be preserved if you don't delete the app first

---

## Cost Comparison

| Method | Cost | What You Get |
|--------|------|--------------|
| **iOS Simulator** | $0 | Unlimited testing, instant reload, no expiry |
| **iPhone + FREE Apple ID** | $0 | Real device testing, 7-day app lifetime |
| **Paid Apple Developer** | $99/year | TestFlight, App Store, unlimited devices, 1-year signing |

---

## When to Upgrade to Paid Account

You only need a paid Apple Developer account ($99/year) when you want to:
- Distribute to beta testers (via TestFlight)
- Submit to the App Store
- Avoid the 7-day rebuild cycle
- Test on more than 3 devices simultaneously

For local development and testing, the **free options are completely sufficient!**

---

## Next Steps

1. ✅ Sync project to your Mac (via Git)
2. ✅ Install development tools (Xcode, Node, etc.)
3. ✅ Test UI in iOS Simulator
4. ✅ Test audio on your iPhone (free Apple ID)
5. 🎉 Develop freely without spending anything!

---

## Questions?

If you encounter issues:
1. Check the Troubleshooting section above
2. Verify all prerequisites are installed correctly
3. Try cleaning and rebuilding the project
4. Check Expo's official documentation: https://docs.expo.dev

Happy developing! 🚀
