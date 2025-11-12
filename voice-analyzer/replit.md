# Voice Analyzer - Mobile App

## Overview
A cross-platform mobile application for iOS and Android that performs real-time voice analysis, capturing pitch and volume data to create visual waveform representations.

## Project Architecture

### Technology Stack
- **Framework**: React Native with Expo SDK
- **Language**: TypeScript
- **Audio**: expo-av for recording and playback
- **Visualization**: @shopify/react-native-skia for high-performance canvas rendering
- **Platforms**: iOS and Android (single codebase)

### Project Structure
```
voice-analyzer/
├── src/
│   ├── components/           # UI components
│   │   ├── WaveformView.tsx  # Canvas-based waveform visualization
│   │   ├── RecordingControls.tsx  # Recording control buttons
│   │   └── AudioPlayer.tsx   # Audio playback component
│   ├── hooks/
│   │   └── useAudioRecorder.ts  # Recording logic and state management
│   ├── utils/
│   │   └── audioAnalysis.ts  # Audio analysis algorithms (RMS, pitch detection)
│   └── types.ts              # TypeScript type definitions
├── App.tsx                   # Main application component
├── app.json                  # Expo configuration
└── package.json              # Dependencies
```

### Key Features
1. **Real-time Audio Recording**: Captures microphone input at 48kHz sample rate
2. **Voice Analysis**: Analyzes amplitude (volume) and pitch every 50ms
3. **Waveform Visualization**: Color-coded bars representing pitch and volume
4. **Recording Controls**: Start, pause, resume, and stop recording
5. **Audio Playback**: Play back recorded audio

## Audio Analysis Algorithms

### Amplitude Analysis (RMS to dBFS)
- Calculates Root Mean Square of audio buffer
- Converts to decibel scale (-90 dB to 0 dB)
- Normalizes to 0.0-1.0 for visualization

### Pitch Detection (Autocorrelation)
- Frequency range: 50-500 Hz (human voice)
- Mean-subtracted signal processing
- Correlation-based lag detection
- Returns null for non-pitched sounds

### Visualization Mapping
- **Pitch → Color**: Blue (low) → Green (mid) → Red (high)
- **Amplitude → Height**: Linear mapping to bar height
- **Gray bars**: Indicate non-pitched sounds (breathing, plosives)

## Important Note on Real-Time Analysis

React Native does not have direct access to Web Audio API's AnalyserNode like browser-based applications. The current implementation uses the expo-av library for recording, which provides high-quality audio capture but limited real-time analysis capabilities.

For production use, consider:
1. Using a web-based version with full Web Audio API support
2. Implementing native modules for deeper audio analysis
3. Post-processing recorded audio for more accurate analysis

## Deployment

### iOS Deployment
1. Requires Apple Developer account
2. Bundle identifier: `com.voiceanalyzer.app`
3. Microphone permission configured in Info.plist
4. Build with: `eas build --platform ios`

### Android Deployment
1. Package name: `com.voiceanalyzer.app`
2. RECORD_AUDIO permission configured
3. Build with: `eas build --platform android`

## Development

### Running the App
```bash
cd voice-analyzer
npm start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator (macOS only)
- Scan QR code with Expo Go app on physical device

### Testing on Physical Devices
- Install Expo Go from App Store (iOS) or Play Store (Android)
- Scan the QR code from the terminal
- Grant microphone permissions when prompted

## Recent Changes
- November 12, 2025: Initial project setup with Expo
- Implemented core audio recording and visualization features
- Configured iOS and Android deployment settings
