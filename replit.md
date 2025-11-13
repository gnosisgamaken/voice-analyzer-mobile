# Voice Analyzer - Real-Time Audio Analysis Application

## Overview

A cross-platform real-time voice analysis application that captures microphone input, analyzes acoustic characteristics (pitch and volume), and provides visual feedback through **pitch-based color-coded waveform visualization**. The project consists of two implementations:

1. **Mobile Application** (React Native + Expo) - Native iOS/Android app
2. **Progressive Web App** (React + Vite) - **Offline-first installable web application** (primary implementation)

The PWA features intelligent recordings management with location-based auto-naming, offline IndexedDB storage, and haptic feedback for native-feeling mobile interactions.

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

**Progressive Web App (voice-web-app/)** - Primary Implementation
- **Framework**: React 19 with Vite 7
- **Language**: TypeScript with strict mode
- **Audio Engine**: Web Audio API (native browser implementation)
- **Visualization**: HTML5 Canvas with pitch-to-color mapping (Blue→Red→Yellow gradient)
- **Storage**: IndexedDB for offline-first recordings with metadata
- **Styling**: Tailwind CSS 4 with Apple-inspired design system
- **PWA Features**: Service worker caching, offline support, installable, home screen integration
- **Location Services**: Geolocation API + OpenStreetMap reverse geocoding
- **Haptics**: Navigator Vibration API for touch feedback

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
- **Real-time pitch data drives color visualization**

**Pitch-to-Color Visualization** (src/utils/pitchToColor.ts)
- **Low pitch (85-180 Hz)**: Blue colors (bass voice, male fundamental)
- **Medium pitch (180-255 Hz)**: Red colors (normal speaking range)
- **High pitch (255-400 Hz)**: Yellow colors (soprano, children's voices)
- **Unpitched sounds**: Gray bars (consonants, breathing, silence)
- Smooth interpolation between color zones to reduce flicker
- Optional `PitchColorSmoother` class for 3-sample moving average

### Component Architecture

**Mobile App Components**
- `WaveformView`: Skia-based canvas renderer using `@shopify/react-native-skia`
- `RecordingControls`: Native touch-optimized recording buttons
- `AudioPlayer`: Expo AV-based playback with native controls

**Web App Components**
- `WaveformCanvas`: HTML5 Canvas with pitch-based color rendering and DPR scaling
- `RecordingControls`: Touch-optimized buttons with haptic feedback
- `AudioPlayer`: HTML5 `<audio>` with timeline scrubbing (±15s skip)
- `RecordingsList`: Offline recordings browser with card-based overlay UI
- `RecordingCard`: Full-screen detail view with rename, share, delete, playback
- **Storage Layer**: IndexedDB wrapper for CRUD operations on recordings
- **Location Services**: Auto-naming based on GPS coordinates + reverse geocoding
- **Haptics System**: Vibration patterns (light/medium/heavy/selection/success/warning/error)

### Design Philosophy

**Mobile-First Approach**
- All UI components optimized for touch interactions
- Large touch targets (minimum 44×44 points)
- Smooth animations using native drivers where possible

**Apple Design Language** (Web App)
- Dynamic color scheme based on voice pitch (Blue/Red/Yellow spectrum)
- Background: `#F2F2F7` (Apple Gray)
- San Francisco font family via system defaults
- Minimal, clean interface with generous whitespace
- iOS-style action sheets and card overlays
- Touch-optimized controls with haptic feedback
- Smooth animations and transitions (scale transforms on active states)

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
- **MediaRecorder API**: Audio blob capture for playback (WebM format)
- **Canvas API**: 2D rendering context for pitch-colored waveforms
- **IndexedDB API**: Client-side database for offline recordings storage
- **Geolocation API**: GPS coordinates for location-based naming
- **Vibration API**: Haptic feedback (navigator.vibrate)
- **Share API**: Native sharing of recordings (with file fallback)

### Platform Permissions
- **iOS**: NSMicrophoneUsageDescription in Info.plist
- **Android**: RECORD_AUDIO permission in manifest
- **Web**: 
  - Microphone permission (required, prompted on first record)
  - Geolocation permission (optional, graceful fallback to "Unknown Location")
  - Storage quota (IndexedDB, automatically managed by browser)

### Build Configuration
- TypeScript 5.9 with strict mode enabled
- ESLint with React Hooks plugin for code quality
- Expo managed workflow (no native code exposure)
- Vite with React plugin for HMR and optimized builds
- Vite PWA plugin with Workbox for service worker generation
- Tailwind CSS 4 with PostCSS processing

## Feature Roadmap

### Phase 1: Core Recording & Management ✅ COMPLETED
- [x] Real-time audio analysis (pitch + amplitude)
- [x] Waveform visualization
- [x] Recording controls (record, pause, resume, stop)
- [x] Accurate timing across pause/resume cycles
- [x] IndexedDB offline storage
- [x] Location-based auto-naming
- [x] Recordings browser with list/detail views
- [x] Rename, share, delete functionality
- [x] Haptic feedback throughout app
- [x] PWA installability with service worker

### Phase 2: Pitch-Based Visualization ✅ COMPLETED
- [x] Pitch-to-color mapping (Blue→Red→Yellow)
- [x] Real-time color updates during recording
- [x] Smooth color transitions
- [x] Gray fallback for unpitched sounds

### Phase 3: Multi-Speaker Detection 🔄 IN PLANNING
**Status**: Architecture design phase
**Target**: On-device speaker diarization for conversation analysis

**Technical Approach** (to be implemented):
- **Speaker Separation**: On-device ML model (WebGPU/WASM)
- **Privacy-First**: No cloud services, all processing client-side
- **Data Model**: Extended `VoiceSample` with `speakerId` field
- **UI Design**: Stacked waveforms (one per speaker)
- **Analysis Mode**: Post-recording processing (not real-time initially)
- **Future Enhancement**: Real-time 2-speaker detection for live feedback

**Open Questions** (require user decisions):
1. Acceptable processing time for post-recording analysis (1-5 seconds?)
2. Maximum supported speakers (2 vs 3+)
3. Speaker labeling (auto-generated vs user-assignable names)
4. Accuracy vs. performance tradeoffs

**Target Users**: 
- Receptionists analyzing customer interactions
- Tour guides reviewing explanations
- Sales professionals studying pitch dynamics
- Lawyers analyzing depositions/interviews
- Anyone needing voice analysis tools

## Recent Changes (November 2025)

### Storage Architecture
- **IndexedDB Implementation** (src/utils/storage.ts)
  - `RecordingsDB` class with async CRUD operations
  - Stores: audio blobs (WebM), waveform samples, metadata
  - Automatic indexing by timestamp for sorted retrieval
  - Version control for future schema migrations

### Location Services
- **Auto-Naming System** (src/utils/location.ts)
  - Format: "{Location} - {Date} {Time}"
  - Example: "Downtown Seattle - Nov 13, 2025 2:45 PM"
  - OpenStreetMap reverse geocoding (free, no API key)
  - Graceful fallback: "Unknown Location" if permission denied
  - Caches location for 1 minute to reduce API calls

### User Experience Enhancements
- **Haptic Feedback** (src/utils/haptics.ts)
  - 7 vibration patterns: light, medium, heavy, selection, success, warning, error
  - Integrated into all touch interactions
  - Automatic capability detection (graceful degradation)
  
- **Recordings Management**
  - Three-dot menu opens recordings list overlay
  - Card-based UI with smooth animations
  - Inline rename with keyboard shortcuts (Enter/Escape)
  - Native share API with download fallback
  - Confirmation dialogs for destructive actions

### Visual Improvements
- **Pitch-Based Colors**: Live waveform reflects voice characteristics
- **Smooth Gradients**: Interpolated colors prevent jarring transitions
- **Gray Indicators**: Visual distinction for non-vocal sounds
- **Mobile Optimizations**: Large touch targets, swipe gestures, safe areas

## Technical Debt & Future Improvements

### Known Limitations
1. **Browser Compatibility**: IndexedDB/Web Audio not supported in all browsers
2. **Storage Quota**: No user-facing quota management UI yet
3. **Export Format**: Only WebM audio (no MP3/WAV conversion yet)
4. **Location Accuracy**: Reverse geocoding accuracy varies by region
5. **Multi-Speaker**: Not yet implemented (Phase 3)

### Planned Enhancements
- [ ] Settings screen (haptic toggle, storage management, export preferences)
- [ ] About page with version info and credits
- [ ] Recording search/filter functionality
- [ ] Batch operations (delete multiple, export all)
- [ ] Waveform zoom and pan controls
- [ ] Audio format conversion (WebM → MP3/WAV)
- [ ] Cloud backup integration (optional, user-controlled)
- [ ] Desktop PWA optimizations (keyboard shortcuts, mouse interactions)