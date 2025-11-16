import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import PlaybackControls from '../components/PlaybackControls';
import VoiceMetrics from '../components/VoiceMetrics';
import { BrandedMetricsOverview } from '../components/BrandedMetricsOverview';
import { BrandedMetricCard, VoiceIQDisplay } from '../components/BrandedMetricCard';
import { calculateBrandedMetrics } from '../utils/brandedMetricsEngine';
import SpectrumVisualizer from '../components/SpectrumVisualizer';
import type { NavigationProp } from '../navigation/SimpleNavigator';
import type { StoredRecording } from '../types';
import { formatTime, formatDate } from '../utils/formatting';

interface RecordingDetailsScreenProps {
  navigation: NavigationProp;
  route: {
    params: {
      recording: StoredRecording;
    };
  };
}

export default function RecordingDetailsScreen({ navigation, route }: RecordingDetailsScreenProps) {
  const { recording } = route.params;

  const {
    playbackState,
    position,
    duration,
    play,
    pause,
    stop,
    seek,
    loadAudio,
    unloadAudio,
  } = useAudioPlayer();

  // Calculate new branded metrics from average voice metrics
  const newBrandedMetrics = recording.averageMetrics 
    ? calculateBrandedMetrics(recording.averageMetrics)
    : null;

  useEffect(() => {
    let isMounted = true;

    if (recording.audioUri) {
      loadAudio(recording.audioUri, recording.duration);
    }

    return () => {
      isMounted = false;
      unloadAudio();
    };
  }, [recording.audioUri, loadAudio, unloadAudio]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{recording.name}</Text>
          <Text style={styles.subtitle}>{formatDate(recording.timestamp, { style: 'long' })}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{formatTime(recording.duration)}</Text>
          </View>
          
          {recording.location?.formattedAddress && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{recording.location.formattedAddress}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>File</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {recording.audioUri ? '✓ Saved' : 'No audio file'}
            </Text>
          </View>
        </View>

        {recording.audioUri && (
          <View style={styles.playbackCard}>
            <Text style={styles.sectionTitle}>Playback</Text>
            <PlaybackControls
              playbackState={playbackState}
              position={position}
              duration={duration}
              onPlay={play}
              onPause={pause}
              onStop={stop}
              onSeek={seek}
            />
          </View>
        )}

        {recording.analysis?.spectrum?.length ? (
          <View style={styles.metricsCard}>
            <Text style={styles.sectionTitle}>Spectrum Explorer</Text>
            <Text style={styles.metricsSubtitle}>
              Tap any column to jump to that exact moment in your recording.
            </Text>
            <SpectrumVisualizer
              frames={recording.analysis.spectrum}
              waveform={recording.analysis.waveform}
              currentTimeMs={position}
              onSeek={seek}
            />
          </View>
        ) : null}

        {/* New Branded Metrics Display */}
        {newBrandedMetrics && (
          <View style={styles.metricsCard}>
            <Text style={styles.sectionTitle}>Voice IQ™</Text>
            <Text style={styles.metricsSubtitle}>Overall vocal quality for this recording</Text>
            <VoiceIQDisplay score={newBrandedMetrics.voiceIQ} />
          </View>
        )}

        {newBrandedMetrics && (
          <View style={styles.metricsCard}>
            <Text style={styles.sectionTitle}>Vocal Metrics</Text>
            <Text style={styles.metricsSubtitle}>Performance across six core dimensions</Text>
            <View style={styles.metricsGrid}>
              <BrandedMetricCard
                metricName="clarity"
                score={newBrandedMetrics.clarity}
              />
              <BrandedMetricCard
                metricName="power"
                score={newBrandedMetrics.power}
              />
              <BrandedMetricCard
                metricName="health"
                score={newBrandedMetrics.health}
              />
              <BrandedMetricCard
                metricName="warmth"
                score={newBrandedMetrics.warmth}
              />
              <BrandedMetricCard
                metricName="confidence"
                score={newBrandedMetrics.confidence}
              />
              <BrandedMetricCard
                metricName="expressiveness"
                score={newBrandedMetrics.expressiveness}
              />
            </View>
          </View>
        )}

        <View style={styles.metricsCard}>
          <Text style={styles.sectionTitle}>Legacy Voice IQ & Branded Metrics</Text>
          <Text style={styles.metricsSubtitle}>Old metrics system (comparison)</Text>
          <BrandedMetricsOverview metrics={recording.averageBrandedMetrics} />
        </View>

        <View style={styles.metricsCard}>
          <Text style={styles.sectionTitle}>Raw Voice Metrics</Text>
          <Text style={styles.metricsSubtitle}>Average values from this recording</Text>
          <VoiceMetrics metrics={recording.averageMetrics} />
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
  topBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  infoLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  infoValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  playbackCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  metricsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  metricsSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  metricsGrid: {
    gap: 12,
  },
});
