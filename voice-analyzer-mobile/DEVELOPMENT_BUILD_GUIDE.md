# Development Build Guide - Voice Analyzer Mobile

## Why Development Builds?

Expo SDK 54's `expo-audio` has a confirmed bug (GitHub Issue #39646) where audio recordings fail in Expo Go on iOS. The recorder returns an empty/zero-byte file instead of the actual recording.

**Solution**: We've migrated to `expo-av` and use **EAS development builds** for real device testing while keeping **web preview** for fast UI iteration.

---

## Dual-Track Workflow

### Track 1: Web Preview (Fast UI Iteration)
- **Use for**: UI/UX development, visual changes, layout testing
- **Command**: `npx expo start --web --port 5000`
- **Audio**: Simulated data (Platform.OS === 'web' guard)
- **Speed**: Instant refresh, no build time

### Track 2: Development Build (Real Mobile Testing)
- **Use for**: Testing real audio recording, location services, haptics
- **Command**: Create build once, install on device, then `npx expo start --dev-client`
- **Audio**: Real recording via expo-av
- **Speed**: One-time build (~10-15 min), then fast refresh like Expo Go

---

## One-Time Setup

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
eas login
```

If you don't have an Expo account, create one at https://expo.dev/signup

### 3. Configure Project

```bash
cd voice-analyzer-mobile
eas build:configure
```

This creates `eas.json` (already included in this project).

---

## Creating Development Builds

### iOS Development Build

#### Requirements:
- Mac with Xcode (for local builds) OR cloud build via EAS
- No paid Apple Developer account needed for development builds

#### Option A: Cloud Build (Recommended - No Mac Required)

```bash
cd voice-analyzer-mobile
eas build --profile development --platform ios
```

1. EAS will ask if you want to create an ad-hoc provisioning profile → **Yes**
2. Wait 10-15 minutes for cloud build
3. Download the `.ipa` file from the EAS website or CLI prompt
4. Install on your iPhone:
   - Use Apple Configurator 2 (Mac)
   - Or drag `.ipa` onto Xcode Devices window
   - Or use `eas build:run --profile development --platform ios` to install directly

#### Option B: Local Build (Requires Mac + Xcode)

```bash
eas build --profile development --platform ios --local
```

### Android Development Build

#### Option A: Cloud Build

```bash
cd voice-analyzer-mobile
eas build --profile development --platform android
```

1. Wait ~10 minutes for build
2. Download `.apk` file
3. Install on Android device:
   ```bash
   adb install your-app.apk
   ```
   Or transfer `.apk` to device and tap to install

#### Option B: Local Build

```bash
eas build --profile development --platform android --local
```

---

## Testing Workflow

### Step 1: Start Development Server

```bash
cd voice-analyzer-mobile
npx expo start --dev-client
```

### Step 2: Connect Your Device

1. Open the development build app on your phone (installed from EAS)
2. Scan the QR code OR
3. Enter the URL manually (e.g., `exp://192.168.1.100:8081`)

### Step 3: Test & Iterate

- **Fast Refresh**: Code changes appear instantly (just like Expo Go)
- **Real Audio**: Recording actually works now!
- **Logs**: View console logs in the terminal where you ran `npx expo start`

---

## Key Differences vs Expo Go

| Feature | Expo Go | Development Build |
|---------|---------|-------------------|
| **Audio Recording (iOS)** | ❌ Broken (SDK 54 bug) | ✅ Works with expo-av |
| **Setup** | Download from App Store | Build via EAS (~15 min) |
| **Iteration Speed** | Instant QR scan | Instant after first build |
| **Custom Native Modules** | ❌ Not supported | ✅ Fully supported |
| **Cost** | Free | Free (EAS has free tier) |

---

## Troubleshooting

### Build Failed - iOS

**Error**: "No Apple Developer account"
- For development builds, you **don't need** a paid account
- EAS creates ad-hoc provisioning automatically
- Just say "Yes" when prompted

### Build Failed - Android

**Error**: "Keystore not found"
- EAS generates keystore automatically
- Just run `eas build` again - it will create one

### Device Not Connecting

1. Ensure device and computer on same WiFi network
2. Try entering URL manually instead of QR code
3. Check firewall isn't blocking port 8081

### Recording Still Not Working

1. Check console logs for `[RECORDING]` prefix
2. Ensure you allowed microphone permissions
3. Verify you're testing on development build, not Expo Go

---

## Production Builds (Future)

When ready to publish to App Store / Play Store:

```bash
# iOS
eas build --profile production --platform ios

# Android
eas build --profile production --platform android
```

This requires:
- **iOS**: Paid Apple Developer account ($99/year)
- **Android**: Google Play Developer account ($25 one-time)

---

## EAS Free Tier Limits

- **30 builds/month** (all platforms combined)
- Unlimited development builds
- Priority builds require paid plan

---

## Quick Reference

```bash
# Web preview (instant, simulated audio)
npx expo start --web --port 5000

# Create iOS development build
eas build --profile development --platform ios

# Create Android development build  
eas build --profile development --platform android

# Start dev server for development builds
npx expo start --dev-client

# Check build status
eas build:list

# View build logs
eas build:view <build-id>
```

---

## Next Steps

1. Create your first development build (iOS or Android)
2. Install on physical device
3. Test real audio recording - it will work!
4. Continue using web preview for UI work
5. Test on development build before major releases

---

**Last Updated**: November 14, 2025  
**Migration**: expo-audio → expo-av completed  
**Status**: Ready for development builds ✅
