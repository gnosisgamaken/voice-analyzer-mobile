# Voice Analyzer - Progressive Web App

## Overview
A premium Progressive Web App for real-time voice analysis with pitch and volume visualization. Features Apple Voice Recorder-inspired design and full Web Audio API integration for accurate acoustic analysis.

## Project Purpose
Real-time voice analysis application that captures microphone input, analyzes acoustic characteristics (pitch and volume), and provides visual feedback through waveform visualization. Designed for mobile-first experience with PWA installability.

## Technology Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS (Apple-inspired design system)
- **Audio**: Web Audio API (native browser support)
- **Deployment**: Progressive Web App (installable)

## Project Structure
```
voice-web-app/
├── src/
│   ├── components/
│   │   ├── WaveformCanvas.tsx      # Canvas-based waveform visualization
│   │   ├── RecordingControls.tsx   # Record/pause/stop controls
│   │   └── AudioPlayer.tsx         # Playback with skip controls
│   ├── hooks/
│   │   └── useAudioRecorder.ts     # Web Audio API recording + analysis
│   ├── utils/
│   │   └── audioAnalysis.ts        # RMS, dBFS, autocorrelation algorithms
│   ├── types.ts                    # TypeScript interfaces
│   ├── App.tsx                     # Main application
│   └── index.css                   # Tailwind + custom styles
├── public/
│   └── manifest.json               # PWA configuration
└── vite.config.ts                  # Vite configuration (port 5000)
```

## Core Features

### 1. Real-Time Audio Recording
- **Microphone Access**: MediaStream API with permission handling
- **Audio Settings**:
  - Echo cancellation: enabled
  - Noise suppression: enabled
  - Auto-gain control: disabled (preserves natural amplitude)
- **Sample Rate**: 48,000 Hz
- **Analysis Interval**: 50ms (20 Hz update rate)

### 2. Acoustic Analysis

#### Amplitude Analysis (RMS to dBFS)
```typescript
- Calculate RMS from time-domain buffer
- Convert to decibel scale: 20 * log10(RMS)
- Clamp to range: -90 dB to 0 dB
- Normalize to 0.0-1.0 for visualization
```

#### Pitch Detection (Autocorrelation)
```typescript
- Detection range: 50-500 Hz (human voice)
- Minimum signal threshold: RMS > 0.01
- Mean-subtracted signal processing
- Lag search window: sampleRate/500 to sampleRate/50
- Peak correlation detection
- Returns null for non-pitched sounds
```

### 3. Waveform Visualization
- **Canvas API**: High-performance 60 FPS rendering
- **Color Coding**: Apple red (#FF3B30) bars
- **Bar Animation**: Smooth amplitude response
- **Responsive**: Adapts to screen width
- **Playback Scrubbing**: Click/tap to seek during playback

### 4. Recording States
- `idle` → `recording` → `paused` → `recording` → `stopped`
- Clean state management with React hooks
- MediaRecorder for audio blob capture
- AnalyserNode for real-time analysis

### 5. Playback Features
- HTMLAudioElement-based playback
- ±15 second skip buttons
- Play/pause toggle
- Timeline scrubber integration
- Current time display with millisecond precision

## Design System (Apple-Inspired)

### Colors
- Background: `#F2F2F7` (Apple gray)
- Primary: `#FF3B30` (Apple red)
- Text: System grays
- Accent: Blue for actions

### Typography
- Font: SF Pro-style system fonts
- Timer: 60px, font-weight 300 (ultra-light)
- Title: 24px, font-weight 600 (semibold)

### Components
- **Buttons**: Large touch targets (44px minimum)
- **Animations**: Scale on press, smooth transitions
- **Shadows**: Subtle elevation for depth
- **Rounded Corners**: 12-20px for cards/buttons

### Layout
- Portrait-first responsive design
- Max-width: 768px (tablet)
- Generous padding and spacing
- Bottom-anchored primary controls

## Progressive Web App Features

### Installability
- Manifest configured for home screen installation
- Standalone display mode (fullscreen app experience)
- Custom app icon and splash screen
- Portrait orientation lock

### Mobile Optimizations
- Touch-optimized controls
- Safe area handling
- Responsive canvas rendering
- Hardware-accelerated animations

## Development

### Running Locally
```bash
cd voice-web-app
npm install
npm run dev
```
Server starts on `http://0.0.0.0:5000` (accessible from mobile devices on same network)

### Building for Production
```bash
npm run build
npm run preview
```

### Testing on Mobile
1. Start dev server
2. Get your computer's local IP address
3. Visit `http://[your-ip]:5000` on mobile device
4. Grant microphone permissions
5. Test recording and playback

## Key Algorithms (Production-Ready)

### RMS Calculation
```typescript
function rms(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}
```

### Autocorrelation Pitch Detection
```typescript
function autoCorrelatePitch(buf: Float32Array, sampleRate: number): number | null {
  // Full implementation in src/utils/audioAnalysis.ts
  // Returns frequency in Hz or null for unpitched sounds
}
```

## Browser Compatibility
- **Chrome/Edge**: Full support
- **Safari**: Full support (iOS 14.5+)
- **Firefox**: Full support
- **Requires**: HTTPS or localhost (for microphone access)

## Performance Targets
- **60 FPS** waveform rendering
- **50ms** analysis latency
- **<100ms** user interaction response
- **Memory**: Efficient sample storage (consider windowing for long recordings)

## Recent Changes
- November 12, 2025: Initial PWA implementation
- Implemented Web Audio API recording with real-time analysis
- Created Apple Voice Recorder-inspired UI
- Configured for mobile deployment with PWA features

## Deployment Notes
This app can be deployed to:
- Replit (auto-deploys, HTTPS enabled)
- Vercel / Netlify (static hosting)
- GitHub Pages (with HTTPS)
- Any static host with HTTPS support

**Important**: Microphone access requires HTTPS in production (localhost works without).

## Future Enhancements
- Multi-speaker support (speaker diarization)
- Export recordings (download as audio file)
- Recording list/library
- Frequency visualization modes
- Sharing capabilities
