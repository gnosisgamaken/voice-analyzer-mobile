# Voice Analyzer - Native Mobile App (React Native)

## Overview

A privacy-first native mobile application for iOS and Android that provides real-time voice analysis, emotion detection, and vocal health monitoring - all processing done on-device with zero cloud dependencies.

**Target Users:** Voice professionals (receptionists, tour guides, salespeople, lawyers) who need conversation analysis, voice fatigue monitoring, and emotion/stress detection.

**Platform:** React Native with Expo SDK 54

## Current Status

### ✅ Completed (Sprint 1.1, 1.2, 1.3, 1.4 & 1.5)
- **Project Setup**:
  - Expo TypeScript template initialized with React Native 0.81.5
  - Project structure: `src/` with screens, components, hooks, utils, types folders
  - Workflow running successfully on port 5000 (web preview)
  
- **Dependencies Installed**:
  - `expo-audio` (SDK 54's new audio package)
  - `fft-js` (JavaScript FFT for spectral analysis)
  - `@shopify/react-native-skia` 2.2.12 (GPU-accelerated graphics)
  - `expo-haptics`, `expo-location`, `expo-file-system`
  - `@react-native-async-storage/async-storage`
  - React Navigation packages (stack navigator, screens, safe area, gesture-handler)
  - `react-native-reanimated` ~3.15.0 (matches Expo Go SDK 54's bundled version)
  - `react-dom`, `react-native-web` (for web preview)

- **Audio Analysis Engine**:
  - ✅ `VoiceAnalyzer` class with FFT-based feature extraction
  - ✅ 7 spectral features: spectralCentroid, spectralFlatness, spectralFlux, loudness, energy, ZCR, RMS
  - ✅ A-weighting for perceptual loudness
  - ✅ Voice metrics calculations: brightness, clarity, richness, energy, pitchStability
  - ✅ Normalization to 0-1 range with realistic scaling
  - ✅ Metric interpretation (Warm/Bright, Clear/Noisy, etc.)

- **Audio Recording**:
  - ✅ `useAudioRecorder` hook with expo-audio integration
  - ✅ Recording state management (idle/recording/paused/stopped)
  - ✅ Start/pause/resume/stop functionality
  - ✅ Accurate duration tracking across pause cycles
  - ✅ Location capture on recording start for auto-naming
  - ✅ Average metrics calculation across all samples
  - ⚠️ **Note**: Real-time PCM access requires custom development build (see AUDIO_IMPLEMENTATION_NOTES.md)

- **Core Utilities**:
  - ✅ Pitch detection via autocorrelation (50-500 Hz range)
  - ✅ RMS calculation, dB conversion, normalization
  - ✅ Pitch-to-color mapping (Blue→Red→Yellow gradient)
  - ✅ TypeScript type definitions matching PWA architecture

- **UI Components (Sprint 1.3)**:
  - ✅ **WaveformView**: Skia-based GPU-accelerated waveform visualization with pitch-colored bars
  - ✅ **RecordingControls**: iOS-style controls with haptic feedback (record/pause/resume/stop)
  - ✅ **VoiceMetrics**: 5 metric cards with gradient progress bars and interpretive labels
  - ✅ **MainRecordingScreen**: Complete integration with SafeAreaView, ScrollView, memory-efficient sample buffering (100-sample ring buffer)

- **Storage & Persistence (Sprint 1.4)**:
  - ✅ **Permissions**: `permissions.ts` utility for requesting/checking location permissions
  - ✅ **Location Service**: GPS coordinates + reverse geocoding for auto-naming recordings
  - ✅ **Storage**: AsyncStorage for metadata, expo-file-system for audio files with correct async APIs
  - ✅ **RecordingsListScreen**: Display saved recordings with duration, location, date, metrics
  - ✅ **Delete Functionality**: Remove both metadata and audio files with confirmation
  - ✅ **Navigation**: React Navigation stack with type-safe routing
  - ✅ **Platform Safety**: Web-compatible code with Platform.OS guards

- **Audio Playback (Sprint 1.5)**:
  - ✅ **useAudioPlayer Hook**: expo-audio integration with memory leak prevention
  - ✅ **PlaybackControls**: iOS-style play/pause/stop with optimistic seek slider
  - ✅ **RecordingDetailsScreen**: Full recording info with playback integration
  - ✅ **Memory Management**: isMounted guards, proper cleanup, interval timer management
  - ✅ **Navigation**: Tap recording cards to view details and play audio

- **Configuration**:
  - ✅ iOS/Android microphone permissions
  - ✅ Location permissions for auto-naming
  - ✅ FFT-js type declarations
  - ✅ Babel config: `babel-preset-expo` + `react-native-reanimated/plugin` for worklet compilation
  - ✅ **CRITICAL Expo Go Fix**: Downgraded to Reanimated v3.15.0 (matches Expo Go's bundled version)

### 📋 Planned
- Sprint 1.6-1.8: Export/share functionality, enhanced list features, waveform thumbnails
- Phase 2: Emotion detection with TensorFlow.js
- Phase 3: Voice health metrics (jitter, shimmer, HNR)

### ⚠️ Important Notes

**Mobile Readiness**: All UI components, audio analysis, and features are **100% mobile-ready**. See `MOBILE_READINESS.md` for complete details on what works now vs what needs development build.

**Real-Time Audio**: Expo's `expo-audio` AudioRecorder does not provide PCM frames during recording in managed workflow. Real-time analysis currently uses simulated data for UI/UX development. See `AUDIO_IMPLEMENTATION_NOTES.md` for:
- Technical details of the limitation
- Path forward (custom development build with native module)
- Timeline estimates (MVP UI: 2-3 days, Real audio: 3-5 days)

**Web Preview**: Uses simulated audio data for testing UI/UX flows. All analysis code is ready - only data source needs swapping for real audio on mobile.

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
- **@react-navigation/stack**: JavaScript stack navigator (Expo Go compatible)
- **react-native-gesture-handler**: Required for stack navigator
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
│   │   └── MainRecordingScreen.tsx    # Primary recording interface ✅
│   ├── components/
│   │   ├── WaveformView.tsx           # Skia waveform visualization ✅
│   │   ├── RecordingControls.tsx      # Haptic control buttons ✅
│   │   └── VoiceMetrics.tsx           # Metrics display cards ✅
│   ├── hooks/
│   │   └── useAudioRecorder.ts        # Recording state management ✅
│   ├── utils/
│   │   ├── audioAnalysis.ts           # RMS, dB, pitch detection ✅
│   │   ├── pitchToColor.ts            # Color mapping utility ✅
│   │   └── enhancedAudioAnalysis.ts   # VoiceAnalyzer class, FFT processing ✅
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces ✅
│   └── navigation/          (planned for Sprint 1.6)
├── assets/
│   └── images/
├── REACT_NATIVE_IMPLEMENTATION_PLAN.md
└── AUDIO_IMPLEMENTATION_NOTES.md
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

## Next Steps (Sprint 1.6 - Export & Share)

1. **Export Functionality**:
   - Share recordings via native share sheet
   - Export audio files to device storage
   - Export metrics as CSV/JSON
   - Copy to clipboard functionality

2. **Enhanced List Screen**:
   - Add waveform thumbnails for each recording
   - Implement search/filter functionality
   - Sort options (date, duration, location)
   - Batch delete functionality

3. **Voice Health Metrics** (Future):
   - Jitter calculation (pitch perturbation)
   - Shimmer calculation (amplitude perturbation)
   - HNR (Harmonic-to-Noise Ratio)
   - Daily/weekly trend tracking

## References

- **Mobile Readiness Status**: `MOBILE_READINESS.md` - Detailed breakdown of what's mobile-ready vs simulated
- **Implementation Plan**: `REACT_NATIVE_IMPLEMENTATION_PLAN.md`
- **Audio Implementation**: `AUDIO_IMPLEMENTATION_NOTES.md`
- Expo Audio Studio: https://www.npmjs.com/package/@siteed/expo-audio-studio
- React Native Skia: https://shopify.github.io/react-native-skia/
- Expo Documentation: https://docs.expo.dev/
- Apple HIG: https://developer.apple.com/design/human-interface-guidelines/

---

**Last Updated**: November 14, 2025 (Sprint 1.5 completed)
**Version**: 0.4.0 (Audio Playback MVP completed, export/share next)
