import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { WaveformView } from './src/components/WaveformView';
import { RecordingControls } from './src/components/RecordingControls';
import { AudioPlayer } from './src/components/AudioPlayer';
import { useAudioRecorder } from './src/hooks/useAudioRecorder';

export default function App() {
  const {
    recordingState,
    samples,
    duration,
    audioUri,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    reset,
  } = useAudioRecorder();

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Voice Analyzer</Text>
        <Text style={styles.subtitle}>Real-time pitch and volume analysis</Text>

        {recordingState !== 'idle' && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>Duration: {formatDuration(duration)}</Text>
            <Text style={styles.statsText}>Samples: {samples.length}</Text>
          </View>
        )}

        <View style={styles.waveformContainer}>
          {samples.length > 0 ? (
            <WaveformView samples={samples} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                {recordingState === 'idle'
                  ? 'Press Start to begin recording'
                  : 'Recording...'}
              </Text>
            </View>
          )}
        </View>

        <RecordingControls
          recordingState={recordingState}
          onStart={startRecording}
          onPause={pauseRecording}
          onResume={resumeRecording}
          onStop={stopRecording}
          onReset={reset}
        />

        {recordingState === 'stopped' && audioUri && (
          <AudioPlayer audioUri={audioUri} />
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>
            • Colors represent pitch (blue = low, green = mid, red = high)
          </Text>
          <Text style={styles.infoText}>
            • Height shows volume (amplitude)
          </Text>
          <Text style={styles.infoText}>
            • Gray bars indicate non-pitched sounds
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
  },
  statsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  waveformContainer: {
    marginBottom: 20,
  },
  placeholder: {
    height: 200,
    backgroundColor: '#000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  infoContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 6,
  },
});
