import React, { useState, useEffect, useCallback } from 'react';
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
import { BrandedMetricCard, VoiceIQDisplay } from '../components/BrandedMetricCard';
import { VoiceSample } from '../types';
import type { NavigationProp } from '../navigation/SimpleNavigator';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { MaterialCard } from '../components/MaterialCard';
import { getBaselineStatus, type BaselineStatus } from '../utils/baselineMetrics';
import { MetricExplanationModal } from '../components/MetricExplanationModal';
import type { MetricKey } from '../content/metricEducation';
import { getEmptyStateCopy, getPostRecordingInsight } from '../content/microcopy';

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
  const [baselineStatus, setBaselineStatus] = useState<BaselineStatus | null>(null);

  const refreshBaselineStatus = useCallback(async () => {
    try {
      const status = await getBaselineStatus();
      setBaselineStatus(status);
    } catch (error) {
      console.warn('Failed to load baseline status', error);
    }
  }, []);

  useEffect(() => {
    refreshBaselineStatus();
  }, [refreshBaselineStatus]);

  useEffect(() => {
    if (recordingState === 'stopped') {
      refreshBaselineStatus();
    }
  }, [recordingState, refreshBaselineStatus]);
  const [educationModal, setEducationModal] = useState<{ metricKey: MetricKey; score?: number } | null>(null);

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
  const brandedMetrics = currentSample?.newBrandedMetrics;
  const postRecordingInsight = brandedMetrics ? getPostRecordingInsight(brandedMetrics) : null;
  const firstRecordingCopy = getEmptyStateCopy('firstRecording');
  const baselineCopy = getEmptyStateCopy('noBaseline');
  const showFirstRecordingCard = baselineStatus?.recordingCount === 0;
  const showBaselineCard =
    Boolean(baselineStatus) && !baselineStatus?.isEstablished && (baselineStatus?.recordingCount ?? 0) > 0;

  const openMetricModal = (metricKey: MetricKey, score?: number) => {
    setEducationModal({ metricKey, score });
  };

  const closeMetricModal = () => setEducationModal(null);

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
            style={styles.notificationsButton}
            onPress={() => navigation.navigate('NotificationSettings')}
          >
            <Text style={styles.notificationsButtonText}>Notifications</Text>
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

          {showFirstRecordingCard && (
            <MaterialCard style={styles.guidanceCard} variant="regular">
              <Text style={styles.guidanceEyebrow}>Welcome</Text>
              <Text style={styles.guidanceTitle}>{firstRecordingCopy.title}</Text>
              <Text style={styles.guidanceBody}>{firstRecordingCopy.body}</Text>
              {firstRecordingCopy.helper && (
                <Text style={styles.guidanceHelper}>{firstRecordingCopy.helper}</Text>
              )}
            </MaterialCard>
          )}

          {showBaselineCard && baselineStatus && (
            <MaterialCard style={styles.guidanceCard} variant="regular">
              <Text style={styles.guidanceEyebrow}>Baseline progress</Text>
              <Text style={styles.guidanceTitle}>{baselineCopy.title}</Text>
              <Text style={styles.guidanceBody}>
                Record {baselineStatus.remainingCount} more session
                {baselineStatus.remainingCount !== 1 ? 's' : ''} to lock in your natural range.
              </Text>
              {baselineCopy.helper && (
                <Text style={styles.guidanceHelper}>{baselineCopy.helper}</Text>
              )}
              <View style={styles.baselineProgressTrack}>
                <View
                  style={[
                    styles.baselineProgressFill,
                    { width: `${baselineStatus.progress}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressMeta}>
                {baselineStatus.recordingCount} / 5 sessions logged
              </Text>
            </MaterialCard>
          )}

          {/* New Branded Metrics Display */}
          {brandedMetrics && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Voice IQ™</Text>
              <VoiceIQDisplay 
                score={brandedMetrics.voiceIQ}
                style={styles.voiceIQCard}
                onLearnMore={() => openMetricModal('voiceIQ', brandedMetrics.voiceIQ)}
              />
            </View>
          )}

          {brandedMetrics && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Vocal Metrics</Text>
              <View style={styles.metricsGrid}>
                <BrandedMetricCard
                  metricName="clarity"
                  score={brandedMetrics.clarity}
                  onPress={() => openMetricModal('clarity', brandedMetrics.clarity)}
                />
                <BrandedMetricCard
                  metricName="power"
                  score={brandedMetrics.power}
                  onPress={() => openMetricModal('power', brandedMetrics.power)}
                />
                <BrandedMetricCard
                  metricName="health"
                  score={brandedMetrics.health}
                  onPress={() => openMetricModal('health', brandedMetrics.health)}
                />
                <BrandedMetricCard
                  metricName="warmth"
                  score={brandedMetrics.warmth}
                  onPress={() => openMetricModal('warmth', brandedMetrics.warmth)}
                />
                <BrandedMetricCard
                  metricName="confidence"
                  score={brandedMetrics.confidence}
                  onPress={() => openMetricModal('confidence', brandedMetrics.confidence)}
                />
                <BrandedMetricCard
                  metricName="expressiveness"
                  score={brandedMetrics.expressiveness}
                  onPress={() =>
                    openMetricModal('expressiveness', brandedMetrics.expressiveness)
                  }
                />
              </View>
            </View>
          )}

          {recordingState === 'stopped' && postRecordingInsight && (
            <MaterialCard style={styles.insightCard} variant='regular'>
              <Text style={styles.insightEyebrow}>Post-recording insight</Text>
              <Text style={styles.insightTitle}>{postRecordingInsight.title}</Text>
              <Text style={styles.insightBody}>{postRecordingInsight.body}</Text>
              {postRecordingInsight.helper && (
                <Text style={styles.insightHelper}>{postRecordingInsight.helper}</Text>
              )}
            </MaterialCard>
          )}
        </ScrollView>
        <MetricExplanationModal
          visible={Boolean(educationModal)}
          metricKey={educationModal?.metricKey ?? null}
          score={educationModal?.score}
          onClose={closeMetricModal}
        />
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
  notificationsButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(36,107,253,0.25)',
    backgroundColor: 'rgba(36,107,253,0.08)',
  },
  notificationsButtonText: {
    fontSize: 15,
    color: COLORS.tintColor,
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
  guidanceCard: {
    marginHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  guidanceEyebrow: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondaryLabel,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  guidanceTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.label,
  },
  guidanceBody: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondaryLabel,
  },
  guidanceHelper: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondaryLabel,
  },
  baselineProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(142,142,147,0.2)',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: SPACING.sm,
  },
  baselineProgressFill: {
    height: '100%',
    backgroundColor: COLORS.tintColor,
    borderRadius: 999,
  },
  progressMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondaryLabel,
    marginTop: SPACING.xs,
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
  insightCard: {
    marginHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  insightEyebrow: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondaryLabel,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  insightTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.label,
  },
  insightBody: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondaryLabel,
  },
  insightHelper: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondaryLabel,
  },
});
