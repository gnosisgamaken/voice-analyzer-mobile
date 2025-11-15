# Voice Analyzer Mobile

A privacy-first, native iOS/Android voice analysis mobile app built with React Native. Provides real-time voice metrics, emotion detection, and vocal health scoring - all processing done on-device with zero cloud dependencies.

## 🎯 Project Overview

**Target Users:** Voice professionals (receptionists, tour guides, sales, lawyers) who need conversation analysis, voice fatigue monitoring, and emotion/stress detection.

**Key Features:**
- ✅ Real-time audio analysis (9 acoustic features)
- ✅ 5 user-friendly voice metrics (brightness, clarity, richness, energy, pitch stability)
- ✅ Pitch-based color-coded waveform visualization (Blue→Red→Yellow)
- ✅ Offline-first with local storage
- ✅ Apple-inspired minimalist design with haptic feedback
- ✅ Works 100% offline, no internet required

**Future Features:**
- Emotion detection (7 emotions + stress)
- Voice health scoring (jitter/shimmer/HNR)

## 🏗️ Technical Stack

- **Framework:** React Native 0.81.5 (React Native CLI workflow)
- **Language:** TypeScript (strict mode)
- **Audio:** `react-native-audio-recorder-player` for recording/playback + realtime metrics
- **Analysis:** Custom FFT-based processing with `fft-js`
- **Graphics:** `@shopify/react-native-skia` for GPU-accelerated waveforms
- **Storage:** AsyncStorage + `react-native-fs`
- **Location:** `react-native-geolocation-service` + lightweight formatter
- **Haptics:** `react-native-haptic-feedback`
- **Permissions:** `react-native-permissions`

## 📁 Project Structure

```
voice-analyzer-mobile/
├── src/
│   ├── screens/          # Main app screens
│   │   ├── MainRecordingScreen.tsx
│   │   ├── RecordingsListScreen.tsx
│   │   └── RecordingDetailsScreen.tsx
│   ├── components/       # Reusable UI components
│   │   ├── WaveformView.tsx
│   │   ├── RecordingControls.tsx
│   │   ├── VoiceMetrics.tsx
│   │   └── PlaybackControls.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useAudioRecorder.ts
│   │   └── useAudioPlayer.ts
│   ├── utils/            # Utility functions
│   │   ├── audioAnalysis.ts
│   │   ├── enhancedAudioAnalysis.ts
│   │   ├── pitchToColor.ts
│   │   ├── storage.ts
│   │   ├── locationService.ts
│   │   └── permissions.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── navigation/        # Navigation setup
│       └── SimpleNavigator.tsx
├── assets/               # Images and icons
├── ios/                  # iOS native project (generated)
└── App.tsx               # Root component
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19.4+ (currently using 20.10.0 - warnings are safe to ignore)
- npm or yarn
- Xcode 15+ (for iOS development)
- CocoaPods (for iOS dependencies)

### Installation

```bash
# Install dependencies
npm install

# For iOS, install CocoaPods dependencies
cd ios && pod install && cd ..
```

### Development

```bash
# Start Metro bundler (React Native CLI)
npm start

# Run on iOS simulator
npm run ios

# (Android build coming soon once native project is added)
```

### Building for Production

#### iOS (via Xcode)

1. Open the workspace:
   ```bash
   open ios/voiceanalyzermobile.xcworkspace
   ```

2. In Xcode:
   - Select your iPhone as the target device
   - Change scheme to "Release" (Product → Scheme → Edit Scheme → Run → Build Configuration → Release)
   - Press `Cmd + R` to build and run

#### Android

Android native project is not yet checked in. The build steps will be documented when the module ships.

## 🎨 Design System

- **Colors:** Apple-inspired palette with pitch-based gradient (Blue→Red→Yellow)
- **Typography:** SF Pro fonts (iOS), system fonts (Android)
- **Spacing:** 8pt grid system
- **Haptics:** Native haptic feedback for all interactions

## 🔒 Privacy & Security

- **100% On-Device Processing:** All analysis happens locally
- **No Cloud Dependencies:** Works completely offline
- **Local Storage Only:** Recordings stored on device
- **No Telemetry:** Zero data collection or tracking

## 📊 Voice Analysis Features

### Real-Time Metrics

1. **Brightness** - Spectral centroid (higher = brighter voice)
2. **Clarity** - Spectral flatness (lower = clearer)
3. **Richness** - Spectral flux (higher = richer harmonics)
4. **Energy** - RMS amplitude (overall voice power)
5. **Pitch Stability** - Variance in fundamental frequency

### Acoustic Features Extracted

- RMS (Root Mean Square)
- Energy
- Zero Crossing Rate (ZCR)
- Spectral Centroid
- Spectral Flatness
- Spectral Flux
- Loudness (A-weighted)
- MFCCs (Mel-Frequency Cepstral Coefficients)
- Pitch (Fundamental Frequency, 50-500 Hz)

## 🛠️ Development Notes

### Build Modes

- **Debug Mode:** Requires Metro bundler running (`npm start`). Enables hot reload and fast refresh.
- **Release Mode:** Standalone app with bundled JavaScript. No dev server needed.

### Code Signing

The iOS project is configured with automatic code signing. Make sure your Apple Developer team is selected in Xcode (Signing & Capabilities tab).

### Testing Audio Features

Audio recording and analysis require a physical device. The iOS simulator does not have microphone access.

## 📝 License

Private project - All rights reserved

## 🤝 Contributing

This is a private project. For questions or suggestions, please contact the project maintainer.

---

**Last Updated:** November 2025  
**Status:** ✅ Production-ready standalone app
