import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import PlaybackControls from '../components/PlaybackControls';
import { BrandedMetricCard, VoiceIQDisplay } from '../components/BrandedMetricCard';
import { calculateBrandedMetrics } from '../utils/brandedMetricsEngine';
import SpectrumVisualizer from '../components/SpectrumVisualizer';
import type { NavigationProp } from '../navigation/SimpleNavigator';
import type { StoredRecording } from '../types';
import { formatTime, formatDate } from '../utils/formatting';
import { MetricExplanationModal } from '../components/MetricExplanationModal';
import type { MetricKey } from '../content/metricEducation';
import { getBaselineMetrics } from '../utils/baselineMetrics';
import { getTrendAnalysis, getTrendHistory } from '../utils/trendTracking';
import { generateInsights, type Insight } from '../utils/insightsEngine';

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
        baseline,
        trendAnalysis,
        history,
      });

      if (isMounted) {
        setInsights(generated);
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

        {insights.length > 0 && (
          <View style={styles.metricsCard}>
            <Text style={styles.sectionTitle}>Insights</Text>
            <Text style={styles.metricsSubtitle}>Baseline and trend highlights</Text>
            {insights.map(insight => (
              <View key={insight.id} style={styles.insightRow}>
                <View style={styles.insightBadge}>
                  <Text style={styles.insightBadgeText}>{formatInsightLabel(insight.category)}</Text>
                </View>
                <View style={styles.insightCopy}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightDescription}>{insight.description}</Text>
                </View>
              </View>
            ))}
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
  insightRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  insightBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(36,107,253,0.12)',
    alignSelf: 'flex-start',
  },
  insightBadgeText: {
    fontSize: 12,
    color: '#246BFD',
    fontWeight: '600',
  },
  insightCopy: {
    flex: 1,
    gap: 4,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  insightDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

function formatInsightLabel(category: Insight['category']): string {
  switch (category) {
    case 'whatsImproving':
      return 'Improving';
    case 'whatToWatch':
      return 'Watch';
    case 'streak':
      return 'Streak';
    case 'correlation':
      return 'Pattern';
    default:
      return 'Insight';
  }
}
