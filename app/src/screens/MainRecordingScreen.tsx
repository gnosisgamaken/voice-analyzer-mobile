import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import WaveformView from '../components/WaveformView';
import RecordingControls from '../components/RecordingControls';
import VoiceMetrics from '../components/VoiceMetrics';
import { BrandedMetricsOverview } from '../components/BrandedMetricsOverview';
import { BrandedMetricCard, VoiceIQDisplay } from '../components/BrandedMetricCard';
import { VoiceSample } from '../types';
import type { NavigationProp } from '../navigation/SimpleNavigator';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { MaterialCard } from '../components/MaterialCard';

interface MainRecordingScreenProps {
  navigation: NavigationProp;
}

const SESSION_COPY: Record<
  string,
  { subtitle: string; helper: string; eyebrow: string }
> = {
  idle: {
    eyebrow: 'Session ready',
    subtitle: 'Ready. Speak at your natural pace.',
    helper: 'When you start recording we’ll analyze in real time.',
  },
  recording: {
    eyebrow: 'Live analysis',
    subtitle: 'Analyzing… hold steady.',
    helper: 'All metrics update instantly as you speak.',
  },
  paused: {
    eyebrow: 'Paused',
    subtitle: 'Paused. Tap resume when you’re ready.',
    helper: 'Long-press resume for a gentle countdown.',
  },
  stopped: {
    eyebrow: 'Session saved',
    subtitle: 'Great work. Review your insights below.',
    helper: 'Scroll to see Voice IQ, spectrum, and notes.',
  },
};

export default function MainRecordingScreen({ navigation }: MainRecordingScreenProps) {
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

  const sessionCopy = SESSION_COPY[recordingState] ?? SESSION_COPY.idle;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => navigation.navigate('BrandedMetricsDemo')}
          >
            <Text style={styles.demoButtonText}>✨ Demo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.recordsButton}
            onPress={() => navigation.navigate('RecordingsList')}
          >
            <Text style={styles.recordsButtonText}>Recordings</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <MaterialCard style={styles.heroCard} variant="regular" tint="rgba(255,255,255,0.78)">
            <View style={styles.heroEyebrowRow}>
              <Text style={styles.heroEyebrow}>{sessionCopy.eyebrow}</Text>
              <View style={styles.heroDot} />
            </View>
            <Text style={styles.heroTitle}>Voice Analyzer</Text>
            <Text style={styles.heroSubtitle}>{sessionCopy.subtitle}</Text>
            <Text style={styles.heroHelper}>{sessionCopy.helper}</Text>
          </MaterialCard>

          <MaterialCard
            style={styles.waveformCard}
            variant="regular"
            tint="rgba(255,255,255,0.82)"
            contentStyle={styles.waveContent}
          >
            <Text style={styles.sectionLabel}>Live spectrum</Text>
            <WaveformView samples={waveformSamples} height={170} />
          </MaterialCard>

          <RecordingControls
            recordingState={recordingState}
            duration={duration}
            onStart={startRecording}
            onPause={pauseRecording}
            onResume={resumeRecording}
            onStop={stopRecording}
          />

          {/* New Branded Metrics Display */}
          {currentSample?.newBrandedMetrics && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Voice IQ™</Text>
              <VoiceIQDisplay 
                score={currentSample.newBrandedMetrics.voiceIQ}
                style={styles.voiceIQCard}
              />
            </View>
          )}

          {currentSample?.newBrandedMetrics && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Vocal Metrics</Text>
              <View style={styles.metricsGrid}>
                <BrandedMetricCard
                  metricName="clarity"
                  score={currentSample.newBrandedMetrics.clarity}
                />
                <BrandedMetricCard
                  metricName="power"
                  score={currentSample.newBrandedMetrics.power}
                />
                <BrandedMetricCard
                  metricName="health"
                  score={currentSample.newBrandedMetrics.health}
                />
                <BrandedMetricCard
                  metricName="warmth"
                  score={currentSample.newBrandedMetrics.warmth}
                />
                <BrandedMetricCard
                  metricName="confidence"
                  score={currentSample.newBrandedMetrics.confidence}
                />
                <BrandedMetricCard
                  metricName="expressiveness"
                  score={currentSample.newBrandedMetrics.expressiveness}
                />
              </View>
            </View>
          )}

          {/* Legacy Metrics for Comparison */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Legacy Voice IQ & Branded Metrics</Text>
            <BrandedMetricsOverview metrics={currentSample?.brandedMetrics} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Raw Voice Metrics</Text>
            <VoiceMetrics metrics={currentSample?.voiceMetrics || null} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  demoButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,215,0,0.3)',
    backgroundColor: 'rgba(255,215,0,0.15)',
  },
  demoButtonText: {
    fontSize: 15,
    color: '#FFD700',
    fontWeight: '600',
  },
  recordsButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  recordsButtonText: {
    fontSize: 15,
    color: COLORS.label,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  heroCard: {
    marginHorizontal: SPACING.md,
  },
  heroEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  heroEyebrow: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondaryLabel,
    letterSpacing: 1,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  heroTitle: {
    ...TYPOGRAPHY.largeTitle,
    color: COLORS.label,
    marginTop: 8,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.label,
    marginTop: 8,
  },
  heroHelper: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondaryLabel,
    marginTop: 4,
  },
  waveformCard: {
    marginHorizontal: SPACING.md,
  },
  waveContent: {
    gap: 12,
    paddingBottom: 4,
  },
  sectionLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondaryLabel,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionHeader: {
    ...TYPOGRAPHY.title2,
    color: COLORS.label,
    paddingHorizontal: SPACING.md,
  },
  voiceIQCard: {
    marginHorizontal: SPACING.md,
  },
  metricsGrid: {
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
});
