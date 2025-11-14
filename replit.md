# Voice Analyzer - Native Mobile App (React Native)

## Overview

Voice Analyzer is a privacy-first native mobile application for iOS and Android that provides real-time voice analysis, emotion detection, and vocal health monitoring. All processing is done on-device with zero cloud dependencies. It targets voice professionals (e.g., receptionists, tour guides, salespeople, lawyers) who need conversation analysis, voice fatigue monitoring, and emotion/stress detection.

## User Preferences

- I prefer simple language and clear explanations.
- I like an iterative development approach, with regular updates and feedback loops.
- Please ask before making major architectural changes or introducing new dependencies.
- Ensure all solutions prioritize on-device processing and user privacy.
- For UI/UX, adhere to an Apple-inspired minimalist design with native haptic feedback.
- When working on audio features, always prioritize testing on physical devices using development builds, as the web preview might not accurately represent native audio behavior.
- I want detailed explanations for any complex technical decisions or trade-offs.

## System Architecture

The application is built with React Native (0.81.5) and Expo SDK 54, utilizing TypeScript in strict mode. It follows a dual-track development strategy: a web preview for fast UI iteration and EAS development builds for real audio and native feature testing.

**UI/UX Decisions:**
- **Design System:** Adheres to Apple's Human Interface Guidelines, using SF Pro fonts, iOS color palette, and an 8pt grid.
- **Color Scheme:** Utilizes a clean palette including Apple Gray 6 for background, white for cards, and standard iOS primary colors (blue, red, green). Pitch visualization uses a blue-red-yellow gradient.
- **Typography:** Defined hierarchy including Large Title (34pt Bold), Title (22pt Regular), Body (17pt Regular), and Caption (12pt Regular) from SF Pro fonts.
- **Spacing:** Consistent spacing system (4pt, 8pt, 16pt, 24pt, 32pt).
- **Interactions:** Native haptic feedback for all user interactions.
- **Waveform Visualization:** GPU-accelerated rendering using `@shopify/react-native-skia` with pitch-based color coding.

**Technical Implementations & Feature Specifications:**
- **Real-Time Voice Analysis:**
    - Extracts 9 acoustic features (RMS, energy, ZCR, spectral centroid, spectral flatness, spectral flux, loudness, MFCCs) using a custom `VoiceAnalyzer` class with FFT-based processing.
    - Calculates 5 user-friendly metrics: Brightness, Clarity, Richness, Energy, Pitch Stability.
    - Implements pitch detection (50-500 Hz range) via autocorrelation.
    - All analysis and metrics are normalized to a 0-1 range.
- **Audio Recording:** Leverages `expo-av` for stable audio recording with state management (idle/recording/paused/stopped), accurate duration tracking, and location capture for auto-naming.
- **Audio Playback:** `useAudioPlayer` hook integrates `expo-av` for playback, including iOS-style controls and an optimistic seek slider.
- **Storage & Persistence:** Uses `@react-native-async-storage/async-storage` for metadata and `expo-file-system` for managing audio files. Location data from `expo-location` is used for auto-naming recordings.
- **Permissions:** Robust handling of microphone and location permissions with runtime requests and user feedback.
- **Navigation:** A custom `SimpleNavigator` (pure React state) ensures Expo Go compatibility without native dependencies.
- **Core Utilities:** Includes `audioAnalysis.ts` for RMS, dB conversion, pitch detection, and `pitchToColor.ts` for color mapping.

**System Design Choices:**
- **On-device processing:** Ensures user privacy by performing all analysis locally without cloud services.
- **Modular Project Structure:** Organized into `screens`, `components`, `hooks`, `utils`, and `types` within the `src/` directory for maintainability.
- **Error Handling & Cleanup:** Includes `isMounted` guards and proper cleanup functions for audio and timers to prevent memory leaks.
- **Platform Guards:** Code includes `Platform.OS` guards to adapt functionality (e.g., simulated audio on web, real audio on native).

## External Dependencies

- **Core Framework:**
    - `react-native`: 0.81.5
    - `expo`: SDK 54
    - `typescript`
- **Audio Processing:**
    - `expo-av`: For audio recording and playback.
    - `fft-js`: JavaScript Fast Fourier Transform for spectral analysis.
- **Graphics & UI:**
    - `@shopify/react-native-skia`: For GPU-accelerated waveform visualization.
- **Storage:**
    - `@react-native-async-storage/async-storage`: For persistent metadata storage.
    - `expo-file-system`: For managing audio files on the device.
- **Location Services:**
    - `expo-location`: For capturing GPS coordinates and reverse geocoding.
- **Haptics:**
    - `expo-haptics`: For native haptic feedback.
- **Development Tools:**
    - `expo-dev-client`: Enables development builds for native module testing.
- **Future Integrations:**
    - `@tensorflow/tfjs-react-native`: Planned for on-device emotion detection.
    - `expo-gl`: Planned for GPU acceleration for ML models.