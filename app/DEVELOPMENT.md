# Development Guide

## Quick Start

### First Time Setup

```bash
# Install dependencies
npm install

# iOS: Install CocoaPods
cd ios && pod install && cd ..
```

### Running the App

**📱 iOS Simulator (Full native features)**
```bash
npm run ios
# Or: npm start, then build in Xcode simulator
```

**📱 Physical Device (Real audio testing)**
```bash
# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Build in Xcode (Debug mode, Cmd + R)
# App connects to Metro automatically
```

**🏭 Production Mode (Standalone)**
1. Open `ios/voiceanalyzermobile.xcworkspace` in Xcode
2. Change scheme to "Release" (Product → Scheme → Edit Scheme)
3. Build and run (Cmd + R)

> 💡 **For fastest development:** Keep Metro running (`npm start`) and rebuild via `npm run ios` or Xcode for native testing. See `FAST_PREVIEW.md` for detailed guide.

## Project Structure

- `src/screens/` - Main app screens
- `src/components/` - Reusable UI components
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions and analysis algorithms
- `src/types/` - TypeScript definitions

## Key Technologies

- **Audio:** `react-native-audio-recorder-player` for recording/playback
- **Analysis:** Custom FFT processing with `fft-js`
- **Graphics:** `@shopify/react-native-skia` for waveforms
- **Storage:** AsyncStorage + `react-native-fs`

## Building for Release

### iOS
1. Open workspace in Xcode
2. Select Release scheme
3. Build and archive
4. Distribute via TestFlight or App Store

### Android
Android native project will be added in a later milestone. For now, focus on iOS builds.

## Testing

- **Audio features:** Must test on physical device (simulator has no microphone)
- **UI/UX:** Can test on simulator or web preview
- **Performance:** Test on real devices for accurate metrics

## Code Style

- TypeScript strict mode enabled
- Apple-inspired design system
- Functional components with hooks
- On-device processing only (privacy-first)

## Troubleshooting

**Build fails:**
- Clean build folder: `Cmd + Shift + K` in Xcode
- Reinstall pods: `cd ios && pod install && cd ..`

**Audio not working:**
- Check microphone permissions (Settings → App → Microphone)
- Ensure testing on physical device
- Verify native modules were installed (`npm install`, `cd ios && pod install`)

**Metro bundler issues:**
- Clear cache: `npm start -- --reset-cache`
- Delete `node_modules` and reinstall
