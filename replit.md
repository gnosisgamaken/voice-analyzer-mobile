# Voice Analyzer Mobile

## Overview

Voice Analyzer is a privacy-first, native iOS/Android voice analysis mobile app built with React Native. It provides real-time voice metrics, vocal health scoring, and trend tracking - all processing done on-device without requiring internet connectivity.

The app targets voice professionals (teachers, speakers, singers, sales professionals) who need conversation analysis, voice fatigue monitoring, and vocal health insights. It uses acoustic analysis to calculate six branded metrics plus a composite Voice IQ™ score, presenting technical data through a calm, coaching-oriented interface.

**Core Value Proposition:** A "Swiss-watch voice screening companion" - precise, reliable, and quietly powerful. The app establishes baselines from initial recordings, tracks trends over time, and delivers actionable insights without overwhelming users with technical jargon.

## MVP Status (November 2025)

**Ready for Build** - Core features implemented and tested:
- Real-time voice recording with PCM streaming (iOS)
- Six branded metrics + Voice IQ composite score
- Clinical-grade diagnostic biomarkers (CPP, Jitter, Shimmer, HNR, Formants, Tremor, Voice Breaks)
- Diagnostic risk assessment with severity levels
- Baseline establishment and trend tracking
- Apple Liquid Glass design system with LiquidGlassButton component
- Insights engine with pattern detection

**Build Instructions:**
1. iOS: `cd app/ios && pod install && cd .. && npx react-native run-ios`
2. Android: `cd app && npx react-native run-android`

**Known TypeScript Issues:** Missing @types declarations for navigation and test packages - these don't affect native builds.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (November 2025)

### MVP Bug Fixes Applied
- Platform-specific audio handling: Android skips WAV analysis (AAC format incompatibility)
- NaN/Infinity validation with `safeNumber()` and `sanitizeFeatures()` functions
- Error handling around `decodeWavFile()` with try-catch
- Android platform beta notice displayed in UI
- Node.js upgraded to v22.17.0

### Liquid Glass Design Compliance
- Light/dark mode adaptive support (removed forced dark mode)
- Apple-compliant color palettes for both modes with proper contrast
- Blur tiers properly configured (thin: 16, regular: 22, ultra: 28)
- `LiquidGlassView` now supports `contentStyle` prop
- `MaterialCard` supports new "regular" variant

### Voice IQ Hero UX (November 2025 - Updated)
- Voice IQ displayed as hero metric (~75% of safe-area-adjusted viewport height)
- Dynamic hero sizing using `useWindowDimensions` hook and `useSafeAreaInsets`
- Hero height calculation: `(windowHeight - insets.top - insets.bottom) * 0.75`
- Voice IQ hero positioned FIRST in scroll content (immediately after header)
- Large score circle (up to 300px, responsive to screen size)
- Secondary metrics collapsed behind "View All Metrics" toggle
- `showDetailedMetrics` state controls metric visibility
- MaterialCard restructured with inner content wrapper to preserve container sizing

### Layout Architecture Fixes (November 2025)
- Safe area handling: All screens use dynamic `useSafeAreaInsets()` with `HEADER_MAX_HEIGHT + insets.top`
- Horizontal padding unified on scroll content containers (removed duplicate card margins)
- MaterialCard inner wrapper uses `flexShrink: 1` to prevent non-hero cards from stretching
- VoiceIQDisplay relies on parent flex layout for sizing (no static HERO_HEIGHT constant)

### Audio Analysis Pipeline Status
- iOS: Real-time PCM streaming via native `VoicePCMStreamer` module
- Analysis modes tracked: 'streaming' (real data), 'fallbackRecorder' (file-based), 'simulated' (dev only)
- Android: Fallback mode due to AAC format incompatibility (recordings may show as "processing")

### Diagnostic Biomarkers (November 2025)
**Clinical-Grade Voice Analysis:**
- **CPP (Cepstral Peak Prominence):** Real cepstrum via inverse FFT of log-magnitude spectrum, linear regression baseline, frame-by-frame analysis with low-energy guards
- **Enhanced Jitter:** Local jitter, RAP (3-point), PPQ5 (5-point) with clinical thresholds (normal ≤1.04%, borderline ≤2%)
- **Enhanced Shimmer:** Local shimmer, APQ3, APQ5 with clinical thresholds (normal ≤3.5%, borderline ≤6%)
- **HNR:** Autocorrelation-based harmonic-to-noise ratio in dB (normal ≥20dB, borderline ≥12dB)
- **Formants:** LPC-based extraction (Levinson-Durbin with stability checks) for F1/F2/F3
- **Vocal Tremor:** FFT-based detection in 3-12 Hz range with depth percentage
- **Voice Breaks:** Pitch/energy transition detection with break count

**Risk Assessment System:**
- Four severity levels: low, moderate, elevated, high
- Confidence scoring based on number of measurable factors
- Per-factor clinical notes with educational content
- Recommendations tailored to risk level

### LiquidGlassButton Component (November 2025)
- Spring physics animations with scale and opacity
- ActivityIndicator for loading states
- Haptic feedback integration (selection, impact patterns)
- Multiple variants: primary, secondary, tertiary, glass, danger
- Multiple sizes: small, medium, large
- Platform-adaptive blur effects with opaque fallbacks

### Known TypeScript Issues (Pre-existing)
- Missing @types for: @react-navigation/*, react-native-safe-area-context, react-native-sfsymbols
- Missing @types/jest for test files
- These are dependency declaration issues, not blocking for native builds

## System Architecture

### Audio Pipeline

**Recording Engine:**
- Uses `react-native-audio-recorder-player` for core recording/playback functionality
- Real-time audio processing via `useAudioRecorder` hook
- Supports pause/resume with state management (idle/recording/paused/stopped)
- Native implementations: iOS uses AVAudioEngine with audio tap for PCM streaming; Android uses AudioRecord
- Graceful degradation: Falls back to file-based recording with simulated metrics when native PCM streaming unavailable

**Analysis Engine:**
- Custom FFT-based processing using `fft-js` library
- Extracts 9 acoustic features: RMS, energy, zero-crossing rate, spectral centroid, spectral flatness, spectral flux, A-weighted loudness, MFCCs
- Pitch detection via autocorrelation algorithm (50-500 Hz range)
- All processing happens on-device in JavaScript/TypeScript for cross-platform compatibility

### Branded Metrics System

**Six Core Metrics:**
1. **Voice Clarity** (💎) - Spectral centroid, spectral flatness, HNR
2. **Vocal Power** (⚡) - RMS (dB), peak dB, dynamic range
3. **Vocal Health** (❤️) - Jitter, shimmer, HNR
4. **Warmth** (☀️) - Formants (F1/F2), MFCC spectral slope
5. **Confidence** (👑) - Pitch stability, resonance, pause cadence
6. **Expressiveness** (🔥) - Pitch range, intensity variance, tempo shifts

**Voice IQ™ Composite Score:**
- Weighted combination of all six metrics (0-100 scale)
- Includes consistency bonus (+5 if all metrics ≥ 60) and balance penalty (-10 if any metric ≤ 30)
- Serves as flagship metric for overall vocal effectiveness

**Implementation Status:**
- Real-time calculation integrated into recording flow
- Type-safe integration with existing audio pipeline
- Backward compatibility maintained with legacy metrics system
- Some metrics currently use simulated data pending advanced feature extraction (jitter/shimmer/HNR require native module completion)

### Baseline & Trend Tracking

**Baseline Establishment:**
- Calculated from user's first 5 recordings
- Stores average values for all 7 metrics (6 branded + Voice IQ)
- Persisted via AsyncStorage for cross-session retention
- Progress UI shows "Building your baseline... X of 5"

**Trend Analysis:**
- Maintains 90-day historical tracking
- Calculates 7-day and 30-day rolling averages
- Comparison system: current recording vs. baseline vs. recent trend
- Powers insights generation with pattern detection

### Data Storage & Persistence

**Recording Storage:**
- Audio files managed via `react-native-fs` in app-specific directories
- Metadata stored in AsyncStorage as JSON
- Each recording includes: timestamp, duration, location (city name), metrics snapshot, audio file URI

**Data Model:**
```typescript
interface StoredRecording {
  id: string;
  timestamp: number;
  duration: number;
  audioUri: string;
  location?: string;
  metrics: VoiceMetrics;
  newBrandedMetrics?: BrandedMetrics;
  voiceIQ?: number;
}
```

### UI/UX Architecture

**Design System:**
- Apple-inspired minimalist design following iOS 26 Liquid Glass principles
- Three-tier material hierarchy: (1) Glass for navigation/chrome, (2) Semi-translucent for cards, (3) Solid for critical data/controls
- Typography uses SF Pro fonts on iOS with Android fallbacks
- 8pt spacing grid system with responsive layouts
- Haptic feedback via `react-native-haptic-feedback` (7 vibration patterns)

**Key Screens:**
1. **MainRecordingScreen** - Primary recording interface with real-time waveform, metrics display, and recording controls
2. **RecordingsListScreen** - History view with trend insights and pattern detection
3. **RecordingDetailsScreen** - Detailed metrics breakdown with comparison to baseline
4. **NotificationSettingsScreen** - User preferences for smart scheduling
5. **DesignSystemGalleryScreen** - Component showcase (dev builds only)

**Component Architecture:**
- Reusable `MaterialCard` component with blur variants (thin: 16, regular: 22, ultra: 28)
- `LiquidGlassView` wrapper handling platform-specific blur implementations
- Respects accessibility: `useReduceTransparency()` hook provides opaque fallbacks
- All components support Dynamic Type sizing

### Insights & Engagement Layer

**Insights Engine:**
- Pattern detection using statistical analysis (linear regression on trend data)
- Four insight categories: Improving, Watch, Streaks, Correlations
- Context-aware generation based on baseline status and recording history
- Positive framing with actionable suggestions

**Microcopy System:**
- Dynamic empty states adapting to user context
- Post-recording insights with behavioral nudges
- Milestone celebrations (streaks, personal bests)
- Gentle suggestions following Atomic Habits principles (habit stacking, environmental cues)

**Educational Content:**
- Metric explanations with scientific grounding (9,742 bytes of content)
- `MetricExplanationModal` component for deep-dive learning
- Use case examples segmented by user type (teachers, speakers, singers)
- Integration point: all `BrandedMetricCard` taps open explanations

### Navigation & Routing

**Stack:**
- React Navigation with native stack navigator
- Bottom tab navigation: Recorder, History, Notifications, Gallery (dev only)
- Each tab has its own stack for deep navigation
- Type-safe navigation using TypeScript param lists

**Routing Structure:**
```
Tab Navigator (Root)
├── RecorderStack
│   └── MainRecording
├── HistoryStack
│   ├── RecordingsList
│   └── RecordingDetails
├── NotificationsStack
│   └── NotificationSettings
└── DevStack (dev builds only)
    ├── DesignSystemGallery
    └── PCMMonitor
```

## External Dependencies

### Core Framework
- **React Native 0.81.5** - Mobile framework using React Native CLI workflow (not Expo)
- **React 19.1.0** - UI library
- **TypeScript 5.9.2** - Type safety with strict mode enabled

### Audio & Analysis
- **react-native-audio-recorder-player** - Native audio recording/playback
- **fft-js** - Fast Fourier Transform for spectral analysis
- **Custom VoicePCMStreamer module** - Native iOS/Android PCM streaming (local module, not npm package)

### UI & Graphics
- **@react-native-community/blur** - Platform-specific blur effects for Liquid Glass design
- **react-native-sfsymbols** - SF Symbols integration for iOS-native iconography
- **@react-navigation/native** + bottom-tabs + native-stack - Navigation framework
- **react-native-gesture-handler** - Gesture system
- **react-native-safe-area-context** - Safe area handling
- **react-native-screens** - Native screen optimization

### Device Features
- **@react-native-community/slider** - Native slider component
- **react-native-haptic-feedback** - Haptic vibration patterns
- **react-native-permissions** - Runtime permission management

### Storage & Services
- **@react-native-async-storage/async-storage** - Key-value storage for metrics/settings
- **react-native-fs** - File system access for audio file management
- **react-native-geolocation-service** - Location services for auto-naming recordings

### Development & Testing
- **Jest** - Unit testing framework
- **ts-jest** - TypeScript support for Jest
- **@react-native/metro-config** - Metro bundler configuration
- **@react-native-community/cli** - React Native command-line tools

### Platform-Specific Notes
- iOS requires CocoaPods for dependency management (`cd ios && pod install`)
- Native audio module requires Xcode build for iOS, Android Studio for Android
- Bluetooth audio detection impacts metric quality (app surfaces warnings via measurement integrity system)
- Background recording requires Info.plist audio mode declaration on iOS