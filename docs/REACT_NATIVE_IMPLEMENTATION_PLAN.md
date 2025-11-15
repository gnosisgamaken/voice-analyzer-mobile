# 📱 React Native Voice Analyzer - Complete Implementation Plan

## 🎯 Project Overview

**Goal:** Build a privacy-first, native iOS/Android voice analysis mobile app using React Native with Expo. The app provides real-time voice metrics, emotion detection, and vocal health scoring - all processing done on-device with zero cloud dependencies.

**Target Users:** Voice professionals (receptionists, tour guides, sales, lawyers) who need conversation analysis, voice fatigue monitoring, and emotion/stress detection.

**Key Features:**
- Real-time audio analysis (9 acoustic features)
- 5 user-friendly voice metrics (brightness, clarity, richness, energy, pitch stability)
- Pitch-based color-coded waveform visualization (Blue→Red→Yellow)
- Offline-first with local storage
- Future: Emotion detection (7 emotions + stress), voice health scoring (jitter/shimmer/HNR)
- Apple-inspired minimalist design with haptic feedback
- Works 100% offline, no internet required

---

## 🏗️ Technical Architecture

### **Core Technology Stack**

```
Framework: React Native with Expo (latest stable)
Language: TypeScript with strict mode
Audio Engine: @siteed/expo-audio-studio (replaces Web Audio API)
ML/AI: @tensorflow/tfjs-react-native (for future emotion detection)
Graphics: @shopify/react-native-skia (GPU-accelerated waveforms)
Storage: AsyncStorage + Expo FileSystem (replaces IndexedDB)
Navigation: @react-navigation/native (native stack)
Haptics: expo-haptics (7 vibration patterns)
Location: expo-location (for auto-naming recordings)
```

### **Why This Stack?**

| Web (PWA) | React Native | Reason |
|-----------|--------------|--------|
| Meyda.js | @siteed/expo-audio-studio | Meyda requires Web Audio API (not available in RN). Expo Audio Studio provides identical features natively |
| Web Audio API | Expo Audio + Native Processing | Direct native audio access, better performance |
| IndexedDB | AsyncStorage + FileSystem | Native mobile storage, more reliable |
| HTML5 Canvas | React Native Skia | GPU-accelerated, 60fps guaranteed |
| Vibration API | Expo Haptics | Richer haptic patterns (7 types vs 1) |
| Service Worker | N/A | Apps are offline-first by default |

### **Code Reusability: 90%**

**Portable (no changes):**
- ✅ Pitch detection algorithm (autocorrelation)
- ✅ Voice metrics calculations (brightness, clarity, etc.)
- ✅ TensorFlow.js models (works identically)
- ✅ Jitter/Shimmer/HNR algorithms (pure math)
- ✅ Business logic and state management
- ✅ Color mapping utilities

**Requires adaptation:**
- ⚠️ Audio capture (Meyda → Expo Audio Studio)
- ⚠️ Storage (IndexedDB → AsyncStorage)
- ⚠️ Rendering (Canvas → Skia)
- ⚠️ Haptics (web → expo-haptics)

---

## 📂 Project Structure

```
voice-analyzer-mobile/
├── app.json                    # Expo configuration
├── package.json
├── tsconfig.json
├── App.tsx                     # Root component
├── src/
│   ├── screens/
│   │   ├── MainRecordingScreen.tsx    # Primary recording interface
│   │   ├── RecordingsListScreen.tsx   # Browse saved recordings
│   │   ├── RecordingDetailScreen.tsx  # Playback & edit recording
│   │   └── SettingsScreen.tsx         # App settings
│   ├── components/
│   │   ├── WaveformView.tsx           # Skia waveform visualization
│   │   ├── RecordingControls.tsx      # Record/pause/stop buttons
│   │   ├── VoiceMetrics.tsx           # Real-time metrics display
│   │   ├── AudioPlayer.tsx            # Playback controls
│   │   └── RecordingCard.tsx          # Recording list item
│   ├── hooks/
│   │   ├── useAudioRecorder.ts        # Main recording hook
│   │   ├── useVoiceAnalysis.ts        # Real-time analysis hook
│   │   └── useRecordings.ts           # Storage management hook
│   ├── utils/
│   │   ├── audioAnalysis.ts           # RMS, dB, pitch detection
│   │   ├── enhancedAudioAnalysis.ts   # VoiceAnalyzer class
│   │   ├── pitchToColor.ts            # Color mapping utility
│   │   ├── storage.ts                 # AsyncStorage wrapper
│   │   ├── location.ts                # GPS + reverse geocoding
│   │   ├── haptics.ts                 # Haptic feedback patterns
│   │   ├── emotionDetection.ts        # ML emotion classifier (Phase 2)
│   │   └── voiceHealth.ts             # Jitter/shimmer/HNR (Phase 3)
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces
│   └── navigation/
│       └── RootNavigator.tsx          # Navigation setup
├── assets/
│   ├── images/
│   └── models/                        # TensorFlow.js models (future)
└── replit.md                          # Project documentation
```

---

## 📋 Phase 1: Core Recording & Voice Metrics (MVP)

### **Sprint 1.1: Project Setup & Dependencies** (Day 1)

**Tasks:**

1. **Initialize Expo TypeScript project**
   ```bash
   npx create-expo-app@latest voice-analyzer-mobile --template expo-template-blank-typescript
   cd voice-analyzer-mobile
   ```

2. **Install core dependencies**
   ```bash
   # Audio processing
   npx expo install @siteed/expo-audio-studio
   
   # Graphics & UI
   npm install @shopify/react-native-skia
   npx expo install expo-haptics expo-location
   
   # Navigation
   npm install @react-navigation/native @react-navigation/native-stack
   npx expo install react-native-screens react-native-safe-area-context
   
   # Storage
   npx expo install @react-native-async-storage/async-storage expo-file-system
   
   # ML (for future phases)
   npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
   npx expo install expo-gl expo-gl-cpp
   ```

3. **Configure TypeScript**
   - Enable strict mode
   - Configure path aliases (@components, @utils, @types)
   - Set up ESLint with React Native + TypeScript rules

4. **Set up permissions**
   - **iOS:** Add to `app.json`:
     ```json
     "ios": {
       "infoPlist": {
         "NSMicrophoneUsageDescription": "This app needs microphone access to analyze your voice in real-time",
         "NSLocationWhenInUseUsageDescription": "We use your location to auto-name recordings with your city"
       }
     }
     ```
   - **Android:** Add to `app.json`:
     ```json
     "android": {
       "permissions": ["RECORD_AUDIO", "ACCESS_FINE_LOCATION"]
     }
     ```

5. **Create project structure**
   - Create all folders: screens/, components/, hooks/, utils/, types/, navigation/
   - Set up basic navigation scaffold

---

## 🎨 Design System

### **Color Palette**

```typescript
const colors = {
  // Backgrounds
  background: '#F2F2F7',      // Apple Gray 6
  card: '#FFFFFF',
  
  // Pitch colors
  pitchLow: 'rgb(59, 130, 246)',     // Blue
  pitchMid: 'rgb(255, 48, 59)',      // Red  
  pitchHigh: 'rgb(255, 204, 0)',     // Yellow
  pitchGray: 'rgb(156, 163, 175)',   // Gray
  
  // iOS colors
  blue: '#007AFF',
  red: '#FF3B30',
  green: '#34C759',
  orange: '#FF9500',
  
  // Text
  text: '#000000',
  secondaryText: '#8E8E93',
  tertiaryText: '#C7C7CC'
};
```

### **Typography**

- Large Title: 34pt, SF Pro Display, Bold
- Title 1: 28pt, SF Pro Display, Regular
- Title 2: 22pt, SF Pro Display, Regular
- Body: 17pt, SF Pro Text, Regular
- Caption: 12pt, SF Pro Text, Regular

### **Spacing**

- xs: 4pt
- sm: 8pt
- md: 16pt
- lg: 24pt
- xl: 32pt
- 2xl: 48pt

---

## 📚 References

- Expo Audio Studio: https://www.npmjs.com/package/@siteed/expo-audio-studio
- React Native Skia: https://shopify.github.io/react-native-skia/
- TensorFlow.js RN: https://github.com/tensorflow/tfjs/tree/master/tfjs-react-native
- Expo Haptics: https://docs.expo.dev/versions/latest/sdk/haptics/
- React Navigation: https://reactnavigation.org/
- Apple HIG: https://developer.apple.com/design/human-interface-guidelines/

---

## ✅ Implementation Status

### Phase 1: MVP Development

**Sprint 1.1: Setup** ⏳ IN PROGRESS
- [ ] Initialize Expo project
- [ ] Install dependencies
- [ ] Configure TypeScript
- [ ] Set up permissions
- [ ] Create project structure

**Sprint 1.2: Audio Engine** 📋 PENDING
- [ ] Port audioAnalysis.ts utilities
- [ ] Create VoiceAnalyzer class with Expo Audio Studio
- [ ] Port pitchToColor utility
- [ ] Create TypeScript types

**Sprint 1.3: Recording** 📋 PENDING
- [ ] Build useAudioRecorder hook
- [ ] Implement real-time analysis
- [ ] Handle permissions

**Sprint 1.4: Visualization** 📋 PENDING
- [ ] Create WaveformView with Skia
- [ ] Implement pitch-based colors

**Sprint 1.5: UI** 📋 PENDING
- [ ] RecordingControls component
- [ ] VoiceMetrics component
- [ ] MainRecordingScreen

**Sprint 1.6: Storage** 📋 PENDING
- [ ] Storage utilities
- [ ] RecordingsListScreen
- [ ] RecordingDetailScreen

**Sprint 1.7: Polish** 📋 PENDING
- [ ] Navigation setup
- [ ] Haptic feedback
- [ ] Final touches

**Sprint 1.8: Testing** 📋 PENDING
- [ ] Test on simulators
- [ ] Test on physical devices
- [ ] Performance optimization

---

**Ready to build! 🚀**
