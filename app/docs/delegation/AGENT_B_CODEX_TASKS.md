# Agent B (Codex 5.1) - Audio & Metrics Tasks

**Role:** Systems Engineer / Audio Specialist
**Focus:** Native Audio Pipeline, Signal Processing, Math
**Context:** You are responsible for the "Swiss-watch precision" of the app.

## 📋 Task List

### 1. Native Audio Pipeline
- [ ] **Create Native Module: `VoicePCMStreamer`**
    - Path: `app/ios/voiceanalyzermobile/VoicePCMStreamer.m` (and header)
    - Specs:
        - Use `AVAudioEngine` with a tap on the input node.
        - Buffer size: 128 or 256 frames (low latency).
        - Format: Float32, 44.1kHz or 48kHz.
        - Bridge method: `startStreaming()` -> emits events with base64 PCM chunks.
        - Bridge method: `stopStreaming()`.
- [ ] **Update Hook: `useAudioRecorder`**
    - Path: `app/src/hooks/useAudioRecorder.ts`
    - Specs:
        - Connect to `VoicePCMStreamer`.
        - Maintain current state management (recording, paused, etc.).
        - Fallback logic if native module fails (keep existing simulation for dev if needed).

### 2. Branded Metrics Engine
- [ ] **Create `brandedMetricsEngine.ts`**
    - Path: `app/src/utils/brandedMetricsEngine.ts`
    - Specs:
        - Implement 6 core metrics:
            1. **Clarity** (Spectral Centroid / High-freq energy)
            2. **Power** (RMS Amplitude)
            3. **Health** (Harmonic-to-Noise Ratio / Jitter estimation)
            4. **Warmth** (Low-mid frequency energy)
            5. **Confidence** (Pitch stability + volume stability)
            6. **Expressiveness** (Pitch range / dynamic range)
        - **Voice IQ™**: Weighted composite of the above.
        - **Normalization**: All outputs must be 0-100.

### 3. Testing
- [ ] **Unit Tests**
    - Write Jest tests for `brandedMetricsEngine` with known input signals (sine waves, silence, white noise).
