# Voice Analyzer - Real-Time Audio Analysis Application

## Overview

A cross-platform real-time voice analysis application that captures microphone input, analyzes acoustic characteristics (pitch and volume), and provides visual feedback through waveform visualization. The project consists of two implementations:

1. **Mobile Application** (React Native + Expo) - Native iOS/Android app
2. **Progressive Web App** (React + Vite) - Installable web application

Both implementations share the same core analysis algorithms and provide identical functionality with platform-appropriate user interfaces.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Dual-Platform Architecture

**Mobile Application (voice-analyzer/)**
- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript with strict mode
- **Audio Engine**: Expo AV for recording and playback
- **Visualization**: Shopify React Native Skia for hardware-accelerated canvas rendering
- **Target Platforms**: iOS and Android via single codebase
- **Build System**: Expo managed workflow

**Progressive Web App (voice-web-app/)**
- **Framework**: React 19 with Vite 7
- **Language**: TypeScript with strict mode
- **Audio Engine**: Web Audio API (native browser implementation)
- **Visualization**: HTML5 Canvas with device pixel ratio scaling
- **Styling**: Tailwind CSS 4 with Apple-inspired design system
- **PWA Features**: Service worker caching, offline support, installable

### Shared Architecture Patterns

**Audio Processing Pipeline** (identical across platforms)
1. Microphone capture with specific constraints (echo cancellation enabled, auto-gain disabled)
2. Real-time analysis every 50ms using Web Audio API concepts
3. Dual acoustic measurements: amplitude (RMS→dBFS) and pitch (autocorrelation)
4. Sample buffering in memory
5. Canvas-based waveform visualization

**State Management** 
- Custom React hooks (`useAudioRecorder`) encapsulate all recording logic
- Recording states: `idle → recording → paused → recording → stopped`
- No external state management libraries; React hooks provide sufficient control

**Data Model**
```typescript
interface VoiceSample {
  timestamp: number;      // Milliseconds from recording start
  amplitude: number;      // Normalized 0.0-1.0
  pitchHz: number | null; // Frequency or null if unpitched
  speakerId?: string;     // Reserved for future multi-speaker support
}
```

### Audio Analysis Algorithms

**Amplitude Analysis** (shared utility in `src/utils/audioAnalysis.ts`)
- Root Mean Square (RMS) calculation from time-domain buffer
- Conversion to decibel scale: `20 * log10(RMS)`
- Clamping to -90 dB to 0 dB range
- Normalization to 0.0-1.0 for visualization

**Pitch Detection** (autocorrelation-based F0 estimation)
- Frequency detection range: 50-500 Hz (human voice range)
- Minimum signal threshold: RMS > 0.01
- Mean-subtracted signal processing for DC offset removal
- Lag search window based on sample rate
- Peak correlation detection
- Returns `null` for non-pitched sounds (breathing, plosives, consonants)

### Component Architecture

**Mobile App Components**
- `WaveformView`: Skia-based canvas renderer using `@shopify/react-native-skia`
- `RecordingControls`: Native touch-optimized recording buttons
- `AudioPlayer`: Expo AV-based playback with native controls

**Web App Components**
- `WaveformCanvas`: HTML5 Canvas with 2D context and DPR scaling
- `RecordingControls`: Touch-optimized web buttons with CSS transitions
- `AudioPlayer`: HTML5 `<audio>` element with custom controls

### Design Philosophy

**Mobile-First Approach**
- All UI components optimized for touch interactions
- Large touch targets (minimum 44×44 points)
- Smooth animations using native drivers where possible

**Apple Design Language** (Web App)
- Color scheme: `#FF3B30` (Apple Red) and `#F2F2F7` (Apple Gray)
- San Francisco font family via system defaults
- Minimal, clean interface with generous whitespace

**Performance Optimizations**
- Analysis throttled to 50ms intervals (20 Hz update rate)
- Waveform displays only last 100 samples (5 seconds at 20 Hz)
- Canvas rendering optimized with requestAnimationFrame
- FFT size of 2048 balances frequency resolution with performance

## External Dependencies

### Mobile Application
- **expo**: v54.0.23 - Managed React Native platform
- **expo-av**: v16.0.7 - Audio recording and playback APIs
- **@shopify/react-native-skia**: v2.3.10 - Hardware-accelerated 2D graphics
- **react-native**: v0.81.5 - Core mobile framework
- **react**: v19.1.0 - UI library

### Progressive Web App
- **vite**: v7.2.2 - Build tool and dev server (port 5000)
- **vite-plugin-pwa**: v1.1.0 - Service worker generation and manifest
- **tailwindcss**: v4.1.17 - Utility-first CSS framework
- **@vitejs/plugin-react**: v5.1.0 - React Fast Refresh support

### Browser APIs (Web App)
- **MediaStream API**: Microphone access with permissions
- **Web Audio API**: AudioContext, AnalyserNode for real-time processing
- **MediaRecorder API**: Audio blob capture for playback
- **Canvas API**: 2D rendering context for waveforms

### Platform Permissions
- **iOS**: NSMicrophoneUsageDescription in Info.plist
- **Android**: RECORD_AUDIO permission in manifest
- **Web**: Microphone permission via browser prompt

### Build Configuration
- TypeScript 5.9 with strict mode enabled
- ESLint with React Hooks plugin for code quality
- Expo managed workflow (no native code exposure)
- Vite with React plugin for HMR and optimized builds