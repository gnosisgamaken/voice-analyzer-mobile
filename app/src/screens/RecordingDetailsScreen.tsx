import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { NavigationBar } from '../components/NavigationBar';
import { MaterialCard } from '../components/MaterialCard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import PlaybackControls from '../components/PlaybackControls';
import { BrandedMetricCard, VoiceIQDisplay } from '../components/BrandedMetricCard';
import { calculateBrandedMetrics } from '../utils/brandedMetricsEngine';
import SpectrumVisualizer from '../components/SpectrumVisualizer';
import type { StoredRecording } from '../types';
import type { HistoryStackParamList } from '../navigation/types';
import { formatTime, formatDate } from '../utils/formatting';
import { InsightsCard } from '../components/InsightsCard';
import { MetricExplanationModal } from '../components/MetricExplanationModal';
import type { MetricKey } from '../content/metricEducation';
import { getBaselineMetrics } from '../utils/baselineMetrics';
import { getTrendAnalysis, getTrendHistory } from '../utils/trendTracking';
import { generateInsights, type Insight } from '../utils/insightsEngine';
import SFSymbol from '../components/SFSymbol';
import { logger } from '../utils/logger';
import { DesignTokens } from '../design/tokens';
import { Typography } from '../design/typography';
import { LoadingSpinner } from '../components/LoadingSpinner';

type RecordingDetailsScreenProps = NativeStackScreenProps<HistoryStackParamList, 'RecordingDetails'>;

export default function RecordingDetailsScreen({ navigation, route }: RecordingDetailsScreenProps) {
  const { recording } = route.params;
  const [educationModal, setEducationModal] = useState<{ metricKey: MetricKey; score?: number } | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);

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

  const brandedMetrics = newBrandedMetrics;

  useEffect(() => {
    let isMounted = true;

    async function loadInsights() {
      if (!brandedMetrics) {
        setInsights([]);
        return;
      }

      const [baseline, trendAnalysis, history] = await Promise.all([
        getBaselineMetrics(),
        getTrendAnalysis(),
        getTrendHistory(30),
      ]);

      const generated = generateInsights({
        latestMetrics: brandedMetrics,
        baseline: baseline ? { isEstablished: true, metrics: baseline } : null,
        trendAnalysis,
        history,
      });

      if (isMounted) {
        setInsights(generated);
        logger.test('Insights generated', { count: generated.length });
      }
    }

    loadInsights();

    return () => {
      isMounted = false;
    };
  }, [brandedMetrics]);

  const openMetricModal = (metricKey: MetricKey, score?: number) => {
    setEducationModal({ metricKey, score });
  };

  const closeMetricModal = () => setEducationModal(null);

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
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <NavigationBar
        title="Recording Details"
        leftSlot={
          <TouchableOpacity
            testID="back-button"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <SFSymbol name="chevron.backward" style={styles.backButtonIcon} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{recording.name}</Text>
          <Text style={styles.subtitle}>{formatDate(recording.timestamp, { style: 'long' })}</Text>
        </View>

        <MaterialCard style={styles.infoCard} variant="solid-elevated">
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
        </MaterialCard>

        {recording.audioUri && (
          <MaterialCard style={styles.playbackCard} variant="solid-elevated">
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
          </MaterialCard>
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

        {insights.length > 0 ? (
          <InsightsCard
            insights={insights}
            title="Insights"
            subtitle="Baseline and trend highlights"
            style={styles.metricsCard}
          />
        ) : (
          <View style={[styles.metricsCard, styles.loadingCard]}>
            <LoadingSpinner />
            <Text style={styles.loadingText}>Generating insights...</Text>
          </View>
        )}

        {/* New Branded Metrics Display */}
        {brandedMetrics && (
          <View style={styles.metricsCard}>
            <Text style={styles.sectionTitle}>Voice IQ™</Text>
            <Text style={styles.metricsSubtitle}>Overall vocal quality for this recording</Text>
            <VoiceIQDisplay
              score={brandedMetrics.voiceIQ}
              onLearnMore={() => openMetricModal('voiceIQ', brandedMetrics.voiceIQ)}
            />
          </View>
        )}

        {brandedMetrics && (
          <View style={styles.metricsCard}>
            <Text style={styles.sectionTitle}>Vocal Metrics</Text>
            <Text style={styles.metricsSubtitle}>Performance across six core dimensions</Text>
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
                onPress={() => openMetricModal('expressiveness', brandedMetrics.expressiveness)}
              />
            </View>
          </View>
        )}

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Keep perturbation data trustworthy.</Text>
          <Text style={styles.noticeBody}>
            Record with the mic about 15–20 cm away and avoid whispering or excessive movement so jitter and shimmer comparisons stay reliable.
          </Text>
        </View>
      </ScrollView>
      <MetricExplanationModal
        visible={Boolean(educationModal)}
        metricKey={educationModal?.metricKey ?? null}
        score={educationModal?.score}
        onClose={closeMetricModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.bgPrimary,
    paddingTop: 52, // NavigationBar height
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
  },
  backButtonIcon: {
    fontSize: 22,
    color: DesignTokens.colors.tint,
  },
  backButtonText: {
    ...Typography.body,
    color: DesignTokens.colors.tint,
    fontWeight: '600',
  },
  infoCard: {
    marginBottom: DesignTokens.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.separator,
  },
  infoLabel: {
    ...Typography.body,
    color: DesignTokens.colors.textSecondary,
  },
  infoValue: {
    ...Typography.body,
    color: DesignTokens.colors.textPrimary,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  playbackCard: {
    marginBottom: DesignTokens.spacing.md,
  },
  metricsCard: {
    marginBottom: DesignTokens.spacing.md,
  },
  noticeCard: {
    marginBottom: DesignTokens.spacing.md,
    padding: DesignTokens.spacing.md,
    borderRadius: DesignTokens.radii.lg,
    backgroundColor: DesignTokens.colors.bgCard,
  },
  noticeTitle: {
    ...Typography.headline,
    color: DesignTokens.colors.textPrimary,
    marginBottom: 4,
  },
  noticeBody: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    ...Typography.title3,
    color: DesignTokens.colors.textPrimary,
    marginBottom: 4,
  },
  metricsSubtitle: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
    marginBottom: DesignTokens.spacing.md,
  },
  metricsGrid: {
    gap: DesignTokens.spacing.sm,
  },
  header: {
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.md,
  },
  title: {
    ...Typography.largeTitle,
    color: DesignTokens.colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body,
    color: DesignTokens.colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  loadingCard: {
    padding: DesignTokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing.sm,
    backgroundColor: DesignTokens.colors.bgCard,
    borderRadius: DesignTokens.radii.lg,
  },
  loadingText: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
  },
});
