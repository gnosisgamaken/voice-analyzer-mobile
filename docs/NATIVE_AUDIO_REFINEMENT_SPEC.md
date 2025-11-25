# Native Audio Pipeline: Refinement & Best Practices Specification

This document contains the official engineering guidelines for implementing and quality-assuring the native audio pipeline for the Voice Analyzer app, based on the deep research analysis.

## 1. iOS - `AVAudioEngine`

### 1.1. Audio Session Configuration

The `AVAudioSession` must be configured for high-fidelity measurement.

**Implementation (Swift):**
```swift
import AVFoundation

func configureAudioSession() throws {
    let session = AVAudioSession.sharedInstance()
    try session.setCategory(.playAndRecord, 
                            mode: .measurement, 
                            options: [.allowBluetooth, .defaultToSpeaker, .duckOthers])
    try session.setActive(true, options: [.notifyOthersOnDeactivation])
}
```

- **Category:** `.playAndRecord` (allows simultaneous I/O).
- **Mode:** `.measurement` (disables system-level audio processing like AGC, crucial for raw analysis).
- **Options:** `.allowBluetooth`, `.defaultToSpeaker`, `.duckOthers`.

### 1.2. Buffer Management

Balance latency and stability by requesting a buffer size of **1024 frames** and an I/O buffer duration of **0.02 seconds**.

**Implementation (Swift):**
```swift
// Set preferred buffer duration on the session
try AVAudioSession.sharedInstance().setPreferredIOBufferDuration(0.02)

// When installing the tap
let inputNode = audioEngine.inputNode
inputNode.installTap(onBus: 0, bufferSize: 1024, format: inputNode.outputFormat(forBus: 0)) { 
    (buffer, when) in
    // ... processing logic ...
}
```

### 1.3. Format Conversion to `Float32Array`

To pass PCM data to JavaScript efficiently, use `memcpy` to copy the audio buffer's float channel data directly.

**Implementation (Swift):**
```swift
// Inside the installTap callback
let nFrames = Int(buffer.frameLength)
guard let channelData = buffer.floatChannelData?[0] else { return }

var floatArray = [Float](repeating: 0, count: nFrames)
memcpy(&floatArray, channelData, nFrames * MemoryLayout<Float>.size)

// Bridge `floatArray` to JavaScript.
// For a JSI module, this could involve aliasing memory for zero-copy.
```

### 1.4. Error Handling & Interruptions

The app must gracefully handle audio interruptions (e.g., phone calls) and route changes (e.g., headphones unplugged).

**Implementation (Swift):**
```swift
func setupNotifications() {
    NotificationCenter.default.addObserver(self, 
        selector: #selector(handleInterruption),
        name: AVAudioSession.interruptionNotification, 
        object: AVAudioSession.sharedInstance())

    NotificationCenter.default.addObserver(self, 
        selector: #selector(handleRouteChange),
        name: AVAudioSession.routeChangeNotification, 
        object: AVAudioSession.sharedInstance())
    
    NotificationCenter.default.addObserver(self,
        selector: #selector(handleEngineConfigChange),
        name: .AVAudioEngineConfigurationChange,
        object: audioEngine)
}

@objc func handleInterruption(notification: Notification) {
    // ... check notification userInfo for .begin/.end and pause/resume engine ...
}

@objc func handleRouteChange(notification: Notification) {
    // ... check reason, stop and restart engine if a mic is lost/gained ...
}

@objc func handleEngineConfigChange(notification: Notification) {
    // ... re-establish connections if needed ...
}
```

## 2. Android - `AudioRecord`

### 2.1. Audio Source Selection

Prioritize the `UNPROCESSED` audio source for the cleanest signal, falling back to `VOICE_RECOGNITION`.

**Implementation (Kotlin):**
```kotlin
import android.media.MediaRecorder
import android.media.AudioManager

val audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
val unprocessedProp = audioManager.getProperty(AudioManager.PROPERTY_SUPPORT_AUDIO_SOURCE_UNPROCESSED)
val hasUnprocessed = unprocessedProp != null && unprocessedProp.toBoolean()

val audioSource = if (hasUnprocessed) {
    MediaRecorder.AudioSource.UNPROCESSED
} else {
    MediaRecorder.AudioSource.VOICE_RECOGNITION
}
```

### 2.2. `AudioRecord` Configuration

Use a sample rate of **44100 Hz**, **`CHANNEL_IN_MONO`**, and **`ENCODING_PCM_16BIT`** for maximum compatibility and efficiency. A buffer size of at least `minBufferSize` (often doubled) is recommended.

**Implementation (Kotlin):**
```kotlin
val sampleRate = 44100
val channelConfig = AudioFormat.CHANNEL_IN_MONO
val audioFormat = AudioFormat.ENCODING_PCM_16BIT

val minBufSize = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat)

val recorder = AudioRecord(
    audioSource,
    sampleRate,
    channelConfig,
    audioFormat,
    minBufSize * 2
)
```

### 2.3. Threading & Buffering

Read from the `AudioRecord` buffer on a dedicated background thread to prevent blocking the UI.

**Implementation (Kotlin Coroutine):**
```kotlin
val bufferSize = minBufSize * 2
val buffer = ShortArray(bufferSize / 2) // ShortArray for 16-bit PCM

CoroutineScope(Dispatchers.IO).launch {
    recorder.startRecording()
    while (isRecording) {
        val readResult = recorder.read(buffer, 0, buffer.size)
        if (readResult > 0) {
            // Process the `buffer` of audio shorts
            // Convert to FloatArray for JS: divide each short by 32767.0
        }
    }
    recorder.stop()
    recorder.release()
}
```

### 2.4. Bluetooth (SCO) Support

To support Bluetooth microphones, manage the SCO audio channel. Be prepared for the sample rate to drop to 8kHz or 16kHz.

**Implementation (Kotlin):**
```kotlin
// Before recording:
audioManager.mode = AudioManager.MODE_IN_COMMUNICATION
audioManager.startBluetoothSco()
audioManager.isBluetoothScoOn = true

// Listen for ACTION_SCO_AUDIO_STATE_UPDATED broadcast to confirm connection.
// Initialize AudioRecord with 8000 or 16000 Hz for SCO.

// After recording:
audioManager.stopBluetoothSco()
audioManager.mode = AudioManager.MODE_NORMAL
```
**Note:** Due to quality limitations, the app should flag recordings made over SCO and warn the user that metric accuracy may be reduced.

## 3. Cross-Platform Measurement Integrity

Implement a pre-analysis QA check to ensure all incoming audio is valid.

### 3.1. QA Checklist

- **Clipping:** Signal amplitude exceeds a threshold (e.g., > 0.99 for float).
- **DC Offset:** The average of the waveform is significantly non-zero (e.g., > 0.01).
- **Low Sample Rate:** Sample rate is below 22050 Hz (flag as degraded quality).
- **High Background Noise:** Signal-to-noise ratio is below a threshold (e.g., < 20 dB).

### 3.2. Clipping Detection Algorithm

A simple and effective clipping detector for a normalized `Float32Array`.

**Implementation (TypeScript):**
```typescript
/**
 * Checks a PCM buffer for clipped samples.
 * @param samples A Float32Array of PCM data, normalized to [-1.0, 1.0].
 * @param clipThreshold The value at which a sample is considered clipped.
 * @returns True if clipping is detected, false otherwise.
 */
function hasClipping(samples: Float32Array, clipThreshold = 0.99): boolean {
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    if (s >= clipThreshold || s <= -clipThreshold) {
      console.warn(`Clipping detected at sample ${i}: value=${s}`);
      return true;
    }
  }
  return false;
}
```
This function should be run on each buffer received from the native layer before it is passed to the analysis engine.
