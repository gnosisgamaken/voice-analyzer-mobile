import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import WaveformView from '../components/WaveformView';
import RecordingControls from '../components/RecordingControls';
import VoiceMetrics from '../components/VoiceMetrics';
import { VoiceSample } from '../types';

export default function MainRecordingScreen() {
  const {
    recordingState,
    currentSample,
    duration,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useAudioRecorder();

  const [samples, setSamples] = useState<VoiceSample[]>([]);

  useEffect(() => {
    if (currentSample) {
      setSamples(prev => {
        const updated = [...prev, currentSample];
        return updated.length > 100 ? updated.slice(-100) : updated;
      });
    }
  }, [currentSample]);

  useEffect(() => {
    if (recordingState === 'idle' || recordingState === 'stopped') {
      setSamples([]);
    }
  }, [recordingState]);

  const waveformSamples = samples.map(s => ({
    pitchHz: s.pitchHz,
    amplitude: s.amplitude,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Voice Analyzer</Text>
          <Text style={styles.subtitle}>Real-time voice analysis</Text>
        </View>

        <View style={styles.waveformContainer}>
          <WaveformView samples={waveformSamples} height={180} />
        </View>

        <RecordingControls
          recordingState={recordingState}
          duration={duration}
          onStart={startRecording}
          onPause={pauseRecording}
          onResume={resumeRecording}
          onStop={stopRecording}
        />

        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Voice Metrics</Text>
          <VoiceMetrics metrics={currentSample?.voiceMetrics || null} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  waveformContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  metricsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});
