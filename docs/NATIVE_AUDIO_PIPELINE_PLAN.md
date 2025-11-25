# Native Audio Pipeline – Execution Plan

**Owner:** Codex 5.1  
**Last updated:** November 2025

## 1. Objectives
- Deliver deterministic, low-latency audio capture that feeds the branded metrics engine in real time.  
- Replace simulated metrics with actual PCM analysis, including measurement integrity warnings for users.  
- Provide QA hooks (telemetry + tooling) so audio science can validate jitter/shimmer/HNR baselines per device.

## 2. Functional Requirements
1. **Capture:** 44.1 kHz (preferred) or device-native 48 kHz mono PCM frames, 16-bit or float, with <30 ms end-to-end latency.  
2. **Streaming Interface:** JS receives Float32Array frames every 20 ms (configurable).  
3. **Measurement Modes:** expose `streaming`, `fallbackRecorder`, `simulated` so UI can inform the user.  
4. **Calibration Hooks:** detect Bluetooth or low sample-rate sources, surface copy via microcopy schema.  
5. **Background Recording:** continue capture when screen locks (Info.plist audio background mode).  
6. **Error Handling:** gracefully degrade to legacy recorder + simulated metrics with user-facing warnings, log analytics.

## 3. Architecture Overview
```
┌────────────┐   PCM frames    ┌────────────────────────┐
│ AVAudioEngine │────────────►│ Native Module Bridge   │
└────────────┘                │ (Expo Modules API)     │
                              └────────────┬───────────┘
                                           ▼
                                  `VoicePCMStreamer`
                                           ▼
                               `useAudioRecorder` hook
                                           ▼
                            `VoiceAnalyzer` + UI surfaces
```

- **iOS:** AVAudioEngine input node with `installTap` (bufferSize 1024). Configure `AVAudioSession` category `.playAndRecord` + `.allowBluetooth` (optional) and mode `.measurement`. Set preferred IO buffer duration 0.005–0.01s. Convert `AVAudioPCMBuffer` to Float32Array, dispatch through Expo event emitter.
- **Android:** `AudioRecord` using `MediaRecorder.AudioSource.VOICE_RECOGNITION`, 44100 Hz, PCM 16-bit. Use `AudioTrack` for sidetone (future). Stream bytes to JS via module.
- **Quality metadata:** each frame includes `sampleRate`, `bitDepth`, `source` so warnings can derive from actual numbers.

## 4. Implementation Steps

### 4.1 iOS Module (`packages/native-audio/ios/VoicePCMStreamer.swift`)
1. Setup Expo Module scaffolding (`expo-module generate`).  
2. Configure `AVAudioSession` (category `.playAndRecord`, mode `.measurement`, `preferredIOBufferDuration=0.01`, `setPreferredSampleRate=44100`).  
3. Instantiate `AVAudioEngine`, install tap on input node with requested buffer size.  
4. Convert incoming `AVAudioPCMBuffer` to Float32 array (normalize if necessary).  
5. Emit events `{ chunk: base64, sampleRate, frameSamples }` to JS.  
6. Handle start/stop, interruptions, route changes (e.g., Bluetooth).  
7. Add background mode handling + permission copy update.

### 4.2 Android Module (`packages/native-audio/android/VoicePCMStreamerModule.kt`)
1. Request RECORD_AUDIO permission (handled by RN side).  
2. Initialize `AudioRecord` with minimum buffer (calculate via `AudioRecord.getMinBufferSize`).  
3. Spawn worker thread to read PCM shorts, convert to Float32, emit events.  
4. Support Bluetooth/Wired detection via `AudioManager`.  
5. Handle lifecycle: pause/resume on app background, release resources.

### 4.3 JS Integration
1. Extend `src/native/pcmStreamer.ts` to detect new module (already stubbed) and forward `qualityMetadata`.  
2. Update `useAudioRecorder`:
   - Prioritize streaming path; set `analysisMode` based on module availability.
   - Feed real PCM into `VoiceAnalyzer` and measurement integrity logic.  
   - Persist quality metrics for each recording (AsyncStorage + metadata).  
3. Surface warnings on Recorder/Details screens (low sample rate, Bluetooth).  
4. Add telemetry events (`audio_quality`, `analysis_mode`) for future analytics.

## 5. QA & Tooling
- **Benchmarks:** build test harness to log latency (difference between capture timestamp and UI update) and noise floor per device.  
- **Automated Checks:** unit-test JS layer with recorded PCM samples; integration test on CI with mocked module.  
- **Manual Matrix:** iPhone 12/13/14/15 + AirPods + wired headset; Android Pixel 7/8. Record 30s script to validate jitter/shimmer outputs.  
- **Telemetry:** log measurement mode, sample rate, interruptions for each recording session.

## 6. Timeline & Owners
| Task | Owner | ETA |
| ---- | ----- | --- |
| Module scaffolding + iOS implementation | Codex 5.1 | Day 2 |
| Android parity | Codex 5.1 | Day 4 |
| JS integration + UI warnings | Codex 5.1 | Day 5 |
| QA matrix + documentation | Codex 5.1 | Day 7 |

## 7. Risks & Mitigations
- **Bluetooth quality variance:** default to on-device mic when possible; show warning + instructions when BT sample rate <32 kHz.  
- **Battery/CPU impact:** monitor CPU usage; allow user to disable live spectrum if device overheats.  
- **Background recording rejection:** include clear App Store privacy copy + user-visible indication when background capture active.

---
This plan feeds Sprint 2 in the new roadmap. Updates roll into `AUDIO_IMPLEMENTATION_NOTES.md` as code lands.
