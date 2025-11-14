# 🚀 Quick Sync to Mac - 5 Minute Setup

This guide gets your Voice Analyzer project from Replit to your Mac and ready for Xcode testing in just a few minutes.

---

## Step 1: Get the Code on Your Mac (2 minutes)

### Option A: Via GitHub (Recommended)

**On Replit:**
1. Open the Shell tab
2. Run these commands:
   ```bash
   cd /home/runner/workspace
   
   # Create a GitHub repo first at github.com/new
   # Then run (replace YOUR_USERNAME with your GitHub username):
   
   git remote add origin https://github.com/YOUR_USERNAME/voice-analyzer-mobile.git
   git branch -M main
   git add .
   git commit -m "Initial sync from Replit"
   git push -u origin main
   ```

**On Your Mac:**
```bash
# Open Terminal
cd ~/Developer  # or wherever you keep projects
git clone https://github.com/YOUR_USERNAME/voice-analyzer-mobile.git
cd voice-analyzer-mobile
```

### Option B: Direct Download

1. Click the three dots (⋮) menu in Replit
2. Choose "Download as zip"
3. Extract to your Mac
4. Open Terminal and navigate to the folder

---

## Step 2: Install Everything (One Command!)

In Terminal on your Mac:

```bash
cd voice-analyzer-mobile

# Install all dependencies
npm install

# Generate iOS native project for Xcode
npx expo prebuild --platform ios

# Install iOS dependencies
cd ios
pod install
cd ..
```

**Time:** ~5-10 minutes (mostly downloading)

---

## Step 3: Open in Xcode

```bash
open ios/voiceanalyzermobile.xcworkspace
```

**⚠️ Important:** Always open the `.xcworkspace` file, NOT `.xcodeproj`

---

## Step 4: Configure Signing (First Time Only)

In Xcode:

1. Click **voiceanalyzermobile** in the left sidebar (top item)
2. Select the **voiceanalyzermobile** target
3. Click **Signing & Capabilities** tab
4. Check ✅ **"Automatically manage signing"**
5. Under **Team**, select your Apple ID
   - Not logged in? Go to Xcode → Settings → Accounts → Add (+)
   - Sign in with your regular Apple ID (FREE - no $99 account needed!)
6. Change **Bundle Identifier** to something unique:
   - Example: `com.yourname.voiceanalyzer`
   - Must be different from the default

---

## Step 5: Run on iOS Simulator

**Easy Mode:**
1. Make sure your device dropdown shows "iPhone 15 Pro" (or any simulator)
2. Click the ▶️ Play button
3. Wait ~2 minutes for first build
4. App launches in simulator! 🎉

**OR use Expo CLI:**
```bash
npx expo start
# Press 'i' for iOS Simulator
```

---

## Step 6: Run on Your iPhone (For Real Audio Testing)

1. **Connect iPhone** via USB cable
2. **Unlock your iPhone**
3. **Trust this Mac** (popup on iPhone)
4. In Xcode, select your **iPhone** from device dropdown
5. Click ▶️ Play button
6. On iPhone: Settings → General → VPN & Device Management
7. **Trust** your developer certificate
8. Launch the app! 🎉

**Note:** App expires after 7 days (just rebuild - takes 1 minute)

---

## 🔄 Daily Sync Workflow

### After Making Changes in Replit

```bash
# In Replit Shell
cd /home/runner/workspace
git add .
git commit -m "Describe your changes"
git push
```

### Pull Changes to Your Mac

```bash
# In Mac Terminal
cd ~/Developer/voice-analyzer-mobile
git pull

# If package.json changed:
npm install

# If native dependencies changed:
cd ios && pod install && cd ..
```

Then just rebuild in Xcode (Cmd + R) - takes ~30 seconds!

---

## 🎯 Quick Reference

| What | Command |
|------|---------|
| **Start dev server** | `npx expo start` |
| **iOS Simulator** | Press `i` after starting |
| **Open in Xcode** | `open ios/voiceanalyzermobile.xcworkspace` |
| **Clean build** | Xcode → Product → Clean Build Folder (Cmd+Shift+K) |
| **Reload app** | Shake device → Reload (or Cmd+R in simulator) |
| **Pull latest** | `git pull && npm install` |

---

## ⚡ Pro Tips

**Fast Iteration:**
- Make UI changes → Just save → Hot reload happens automatically!
- Only rebuild in Xcode when changing native code

**Debugging:**
- Shake iPhone → Open developer menu
- Enable "Fast Refresh" for instant updates
- Use Chrome DevTools for debugging

**First Build Taking Forever?**
- Normal! First build: 2-5 minutes
- Subsequent builds: 10-30 seconds
- Clean → Rebuild: ~1 minute

---

## 🆘 Troubleshooting

**"No simulators found"**
```bash
# Install iOS simulators
xcode-select --install
open -a Simulator
```

**"Pod install failed"**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
```

**"Bundle identifier already in use"**
- Change it in Xcode → Signing & Capabilities → Bundle Identifier

**Metro bundler issues**
```bash
npx expo start --clear
watchman watch-del-all
```

**App crashes on launch**
- Check Xcode console for error messages
- Try clean build: Cmd+Shift+K, then Cmd+R

---

## ✅ That's It!

You're now set up for seamless Replit ↔ Mac development:

- ✅ Sync via Git (push/pull)
- ✅ Test in iOS Simulator (instant)
- ✅ Test on your iPhone (real audio)
- ✅ Hot reload for fast iteration
- ✅ 100% FREE (no paid accounts needed)

Happy coding! 🚀
