# Voice Analyzer - Native Mobile App (React Native)

## Overview

A privacy-first native mobile application for iOS and Android that provides real-time voice analysis, emotion detection, and vocal health monitoring - all processing done on-device with zero cloud dependencies.

**Target Users:** Voice professionals (receptionists, tour guides, salespeople, lawyers) who need conversation analysis, voice fatigue monitoring, and emotion/stress detection.

**Platform:** React Native with Expo SDK 54

## Current Status

### ✅ Completed
- Project initialized with Expo TypeScript template
- Core dependencies installed (Skia, Navigation, Haptics, Location, AsyncStorage, FileSystem, Audio)
- iOS and Android permissions configured (microphone, location)
- Project structure created (screens/, components/, hooks/, utils/, types/, navigation/)
- Audio analysis utilities ported from PWA (RMS, pitch detection, dB conversion)
- Pitch-to-color mapping utility ported (Blue→Red→Yellow gradient)
- TypeScript types defined (VoiceSample, VoiceMetrics, RecordingState, StoredRecording)
- Basic MainRecordingScreen created with Apple-inspired design
- Workflow configured and running on port 5000 (web preview)

### 🚧 In Progress
- Sprint 1.2: Audio Analysis Engine (next up)

### 📋 Planned
- Sprint 1.3-1.8: Complete MVP (recording, waveform, voice metrics, storage)
- Phase 2: Emotion detection with TensorFlow.js
- Phase 3: Voice health metrics (jitter, shimmer, HNR)

## Tech Stack

### Core Framework
- **React Native**: 0.81.5 with Expo SDK 54
- **TypeScript**: Strict mode enabled
- **Bundler**: Metro (Expo)

### Audio Processing
- **expo-av**: Audio recording and playback
- **Custom algorithms**: Pitch detection (autocorrelation), RMS, voice metrics

### Graphics & UI
- **@shopify/react-native-skia**: GPU-accelerated waveform visualization (planned)
- **Apple Design System**: SF Pro fonts, iOS color palette, 8pt grid

### Navigation
- **@react-navigation/native**: Native stack navigator
- **react-native-screens**: Native screen components
- **react-native-safe-area-context**: Safe area insets

### Storage
- **@react-native-async-storage/async-storage**: Metadata storage
- **expo-file-system**: Audio file management

### Location
- **expo-location**: GPS coordinates + reverse geocoding

### Haptics
- **expo-haptics**: 7 vibration patterns (light, medium, heavy, selection, success, warning, error)

### Machine Learning (Future)
- **@tensorflow/tfjs-react-native**: On-device emotion detection
- **expo-gl**: GPU acceleration for ML

## Project Structure

```
voice-analyzer-mobile/
├── app.json                 # Expo configuration with permissions
├── App.tsx                  # Root component
├── package.json
├── tsconfig.json
├── src/
│   ├── screens/
│   │   └── MainRecordingScreen.tsx    # Primary recording interface
│   ├── components/           (planned)
│   ├── hooks/               (planned)
│   ├── utils/
│   │   ├── audioAnalysis.ts          # RMS, dB, pitch detection ✅
│   │   └── pitchToColor.ts           # Color mapping utility ✅
│   ├── types/
│   │   └── index.ts                  # TypeScript interfaces ✅
│   └── navigation/          (planned)
├── assets/
│   └── images/
└── REACT_NATIVE_IMPLEMENTATION_PLAN.md
```

## Features

### Phase 1: MVP (Current Focus)

**Real-Time Voice Analysis:**
- 9 acoustic features: RMS, energy, ZCR, spectral centroid, spectral flatness, spectral flux, loudness, MFCCs
- 5 user-friendly metrics: Brightness, Clarity, Richness, Energy, Pitch Stability
- Pitch detection: 50-500 Hz (human voice range) using autocorrelation

**Waveform Visualization:**
- Pitch-based color coding (Blue→Red→Yellow gradient)
- GPU-accelerated rendering with Skia
- Last 100 samples (5 seconds at 20 Hz)

**Recording Management:**
- Start/pause/resume/stop controls
- Accurate timing across pause cycles
- Location-based auto-naming
- Offline storage with metadata

**Design:**
- Apple-inspired minimalist interface
- Native haptic feedback on all interactions
- Safe area support (notch, home indicator)

### Phase 2: Emotion Detection (Future)

- 7 emotions: Neutral, Happy, Sad, Angry, Fearful, Surprised, Disgusted
- Stress level: 0-100% score
- On-device ML with TensorFlow.js
- Real-time analysis every 1-2 seconds

### Phase 3: Voice Health Metrics (Future)

- Jitter: Pitch perturbation (<1% normal, >1.04% fatigue)
- Shimmer: Amplitude perturbation (<3.81% normal)
- HNR: Harmonic-to-Noise Ratio (>20 dB normal, <13 dB hoarse)
- Daily/weekly trend tracking
- Voice fatigue warnings

## Code Reusability from PWA

### 100% Portable (No Changes)
- ✅ `audioAnalysis.ts`: RMS, dB conversion, pitch detection
- ✅ `pitchToColor.ts`: Color mapping with smooth interpolation
- ✅ Voice metrics calculation logic
- ✅ TensorFlow.js models (future)
- ✅ Jitter/Shimmer/HNR algorithms (future)

### Adapted for React Native
- ⚠️ Audio capture: Web Audio API → Expo AV
- ⚠️ Feature extraction: Meyda.js → Custom/Expo Audio Studio
- ⚠️ Storage: IndexedDB → AsyncStorage + FileSystem
- ⚠️ Rendering: Canvas → React Native Skia
- ⚠️ Haptics: Vibration API → Expo Haptics

## Permissions

### iOS (Info.plist)
```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access to analyze your voice in real-time</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>We use your location to auto-name recordings with your city</string>
```

### Android (AndroidManifest.xml)
- `RECORD_AUDIO`: Microphone access
- `ACCESS_FINE_LOCATION`: GPS for auto-naming

## Design System

### Colors
```typescript
{
  background: '#F2F2F7',      // Apple Gray 6
  card: '#FFFFFF',
  blue: '#007AFF',            // iOS Blue
  red: '#FF3B30',
  green: '#34C759',
  text: '#000000',
  secondaryText: '#8E8E93',
  
  // Pitch colors
  pitchLow: 'rgb(59, 130, 246)',     // Blue
  pitchMid: 'rgb(255, 48, 59)',      // Red
  pitchHigh: 'rgb(255, 204, 0)',     // Yellow
  pitchGray: 'rgb(156, 163, 175)',   // Gray (unpitched)
}
```

### Typography
- **Large Title**: 34pt, SF Pro Display, Bold
- **Title**: 22pt, SF Pro Display, Regular
- **Body**: 17pt, SF Pro Text, Regular
- **Caption**: 12pt, SF Pro Text, Regular

### Spacing
- xs: 4pt, sm: 8pt, md: 16pt, lg: 24pt, xl: 32pt

## Known Issues

### Node.js Engine Warnings
- Current: Node v20.19.3
- Required: Node v20.19.4
- **Impact**: None (warnings only, app runs fine)
- **Reason**: React Native 0.81.5 requires exact version

### Package Version Warnings
- @shopify/react-native-skia: 2.3.12 installed, 2.2.12 expected
- **Impact**: May have minor compatibility issues
- **Action**: Monitor for breaking changes

## Development Commands

```bash
# Start Expo dev server
cd voice-analyzer-mobile
npx expo start

# Start web preview
npx expo start --web --port 5000

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Install new packages
npx expo install <package-name>
```

## Next Steps (Sprint 1.2)

1. Install @siteed/expo-audio-studio for audio feature extraction
2. Create VoiceAnalyzer class to extract 9 audio features
3. Implement voice metrics calculations (brightness, clarity, richness, energy, pitch stability)
4. Create useVoiceAnalysis hook for real-time processing
5. Test audio analysis on actual audio input

## References

- Implementation Plan: `REACT_NATIVE_IMPLEMENTATION_PLAN.md`
- Expo Audio Studio: https://www.npmjs.com/package/@siteed/expo-audio-studio
- React Native Skia: https://shopify.github.io/react-native-skia/
- Expo Documentation: https://docs.expo.dev/
- Apple HIG: https://developer.apple.com/design/human-interface-guidelines/

---

**Last Updated**: November 14, 2025
**Version**: 0.1.0 (MVP in development)
