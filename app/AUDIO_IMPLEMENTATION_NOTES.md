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
- ✅ FFT-based spectral feature extraction
- ✅ Voice metrics calculations (brightness, clarity, richness, energy, pitch stability)
- ✅ Pitch detection algorithm (autocorrelation)
- ✅ Type-safe interfaces matching PWA

### What Uses Simulated Data
- ⚠️ Real-time voice metrics (random values in realistic ranges)
- ⚠️ Pitch detection (random 150-300 Hz)
- ⚠️ Spectral features (random but realistic values)

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
