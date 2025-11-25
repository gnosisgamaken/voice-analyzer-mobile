# Audio Implementation Notes

## Real-Time Audio Analysis Limitation

### Discovery (November 14, 2025)

**Issue**: Expo's `expo-audio` AudioRecorder does not provide real-time PCM audio frames during recording in the managed workflow.

**Technical Details**:
- `AudioRecorder` only emits `recordingStatusUpdate` events (status changes, not audio data)
- PCM frames are only accessible via `uri` property AFTER stopping the recording
- `useAudioSampleListener` exists but only works with `AudioPlayer` (playback), not `AudioRecorder`
- Web Audio API is available on web but not in React Native

**Impact on MVP**:
- Real-time voice metrics display uses simulated data for testing
- Full FFT analysis engine (`VoiceAnalyzer` class) is implemented but not connected to live audio
- UI/UX can be fully developed and tested
- All visual components work correctly

## Path Forward for Real Audio

See `docs/NATIVE_AUDIO_PIPELINE_PLAN.md` for the detailed, sprint-ready breakdown. Highlights below are the high-level phases referenced in that plan:

### Option 1: Custom Development Build (Recommended for Production)

**Approach**: Create Expo development build with custom native module for PCM streaming

**Steps**:
1. Create custom Expo module using Expo Modules API
2. Implement native audio capture:
   - iOS: `AVAudioEngine` with audio tap for PCM chunks
   - Android: `AudioRecord` with buffer callbacks
3. Stream 10-20ms PCM chunks to JavaScript
4. Feed chunks to `VoiceAnalyzer.extractFeatures()` and `autoCorrelatePitch()`
5. Build custom development client with `eas build --profile development`

**Pros**:
- True real-time analysis (10-50ms latency)
- Full control over audio processing
- Still uses Expo ecosystem
- Works on physical devices

**Cons**:
- Cannot use Expo Go for testing
- Requires native development knowledge
- More complex deployment

### Option 2: Third-Party Native Library

**Libraries**:
- `react-native-audio-record`: Simple audio recording with PCM access
- `react-native-webrtc`: Full WebRTC with audio streams
- `react-native-live-audio-stream`: Real-time PCM streaming

**Pros**:
- Pre-built native modules
- Active communities
- Proven in production

**Cons**:
- Requires bare workflow or custom development build
- Additional dependencies
- May have platform-specific quirks

### Option 3: Hybrid Approach (Current MVP)

**Approach**: Use simulated real-time data for web testing, add real audio later

**Steps**:
1. ✅ Implement full UI with simulated metrics
2. ✅ Build VoiceAnalyzer class with FFT analysis
3. ✅ Create useAudioRecorder hook structure
4. ⏳ Complete waveform visualization (Skia)
5. ⏳ Build all UI components
6. ⏳ Test complete UX flow
7. 🔜 Add real audio via Option 1 or 2

**Pros**:
- Fast MVP iteration
- Test in Expo Go on web
- All UI/UX can be validated
- Code is ready for real audio integration

**Cons**:
- Not true real-time analysis yet
- Needs custom build for production

## Current Implementation

### What Works
- ✅ Audio recording (start/pause/resume/stop) with expo-audio
- ✅ Recording state management
- ✅ Duration tracking across pause cycles
- ✅ JS bridge for future native PCM streaming (`src/native/pcmStreamer.ts`) that feeds `useAudioRecorder`
- ✅ FFT-based spectral feature extraction
- ✅ Voice metrics calculations (brightness, clarity, richness, energy, pitch stability)
- ✅ Pitch detection algorithm (autocorrelation)
- ✅ Type-safe interfaces matching PWA
- ✅ Branded metrics engine (`calculateBrandedMetrics`) wired into live recorder + saved-session analysis
- ✅ Baseline + trend tracking fed automatically from each saved session
- ✅ Insights + notification scaffolding ready to react to audio metrics

### What Uses Simulated Data
- ⚠️ Real-time voice metrics (random values in realistic ranges)
- ⚠️ Pitch detection (random 150-300 Hz)
- ⚠️ Spectral features (random but realistic values)
- ⚠️ The PCM bridge falls back to simulated data until the native `VoicePCMStreamer` module is shipped

### Ready for Real Audio
When PCM frames become available, simply replace the mock data in `processAudioBuffer()`:

```typescript
// Current (simulated):
const features: AudioFeatures = {
  spectralCentroid: 2000 + Math.random() * 1000,
  // ... more random values
};

// Future (real audio):
const pcmBuffer = new Float32Array(audioSample.channels[0].frames);
const features = analyzerRef.current.extractFeatures(pcmBuffer);
const pitchHz = autoCorrelatePitch(pcmBuffer, 44100);
```

## Recommendations

1. **For MVP/Testing**: Continue with current approach
   - Build complete UI with simulated metrics
   - Test all interactions and flows
   - Validate design and UX

2. **For Production**: Implement custom development build
   - Use Expo Modules API for native audio capture
   - Stream PCM chunks at 20 Hz (50ms intervals)
   - Wire to existing `VoiceAnalyzer` class

3. **Timeline Estimate**:
   - MVP UI completion: 2-3 days
   - Custom audio module: 3-5 days (if needed)
   - Testing and refinement: 2-3 days

## References

- Expo Modules API: https://docs.expo.dev/modules/overview/
- Expo Development Builds: https://docs.expo.dev/develop/development-builds/introduction/
- iOS AVAudioEngine: https://developer.apple.com/documentation/avfaudio/avaudioengine
- Android AudioRecord: https://developer.android.com/reference/android/media/AudioRecord

---

**Last Updated**: November 14, 2025
**Status**: MVP in progress with simulated data, production path identified

## November 16, 2025 – Audio Pipeline Audit

1. **PCM Capture**
   - `VoicePCMStreamer` native module (iOS stub) is in place and bridged through `src/native/pcmStreamer.ts`.
   - `useAudioRecorder` subscribes to the PCM streamer; when native frames are unavailable it falls back to simulated analysis so UI/devloop continues to work.
   - Recording lifecycle (`startRecording`, `pauseRecording`, `resumeRecording`, `stopRecording`) has been validated on device builds; Expo Go still uses the simulated path until the Expo Modules build is cut.

2. **Feature Extraction**
   - `enhancedAudioAnalysis.ts` hosts `VoiceAnalyzer.extractFeatures` and is already invoked inside `useAudioRecorder` for each frame (real or simulated) before storing snapshots in `allSamplesRef`.
   - Pitch is derived via `autoCorrelatePitch`, then voice-health helpers (`analyzeVoiceHealth`, `analyzeFluency`) enrich the sample before it reaches the branded metrics engine.

3. **Metrics Engine**
   - `calculateBrandedMetrics` now runs in two places:
     1. Per-frame live metrics (`currentSample.newBrandedMetrics`) for UI display.
     2. Per-session averages (`newAverageBrandedMetrics`) saved with each recording for baseline/trend tracking and insights generation.
   - Legacy metrics remain stored for comparison, but all new UI surfaces use the branded engine.

4. **Persistence & Trends**
   - `saveRecordingMetadata` persists the raw metrics, branded averages, and analysis placeholders.
   - On every save we now call `addRecordingToBaseline`, `addToTrendHistory`, and `analyzeRecordingMilestones`, ensuring baselines/streaks/insights stay synchronized without extra user steps.

5. **Remaining Gaps Before Scientific Refresh**
   - The simulated PCM path still limits absolute accuracy; once the custom Expo Module is dropped in, swap the random-data blocks inside `processAudioBuffer()` with the real PCM buffer as outlined earlier.
   - Additional calibration constants (formant windows, health thresholds) will be updated once the upcoming research material arrives.
   - Device testing should prioritize the development build with `AVAudioEngine`/`AudioRecord` taps to validate noise conditions and microphone gain handling.

**Conclusion:** The architectural plumbing from live audio → feature extraction → branded metrics → storage/insights is complete. The remaining work before ingesting new science is (a) shipping the production PCM streamer and (b) tuning the normalization constants when fresh research arrives.

## November 17, 2025 – Measurement Integrity Alerts

1. **Analysis Modes**
   - `useAudioRecorder` now exposes the current measurement mode (`streaming`, `fallbackRecorder`, or `simulated`) so UI surfaces can react immediately.
   - Streaming mode automatically clears warnings when the Expo/Native PCM bridge delivers 44.1 kHz / 16-bit frames; fallback modes mark quality as degraded.

2. **Sample-Rate Enforcement**
   - Incoming PCM frames are inspected; anything below 44.1 kHz triggers a `lowSampleRate` warning.
   - Warnings persist when we drop to the legacy recorder path (common when Bluetooth mics downsample to 16 kHz).

3. **User-Facing Microcopy**
   - `MainRecordingScreen` now renders Liquid Glass “Measurement quality” cards driven by the new warnings.
   - Copy pulls from `measurementLowSampleRate` / `measurementSimulated` prompts (see `microcopy.ts`), reminding users to disable low-fidelity accessories or install the dev build with the native streamer.

Result: the roadmap item “surface measurement low sample rate microcopy when falling back” is now covered, and QA can quickly tell whether they’re exercising the calibrated PCM path or a degraded/simulated mode.
