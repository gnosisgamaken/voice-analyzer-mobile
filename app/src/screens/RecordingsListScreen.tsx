import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { StoredRecording } from '../types';
import { getAllRecordings, deleteRecording } from '../utils/storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { formatTime, formatDate } from '../utils/formatting';
import { logger } from '../utils/logger';
import { getEmptyStateCopy, getMilestoneMessage, getCoachingCopy, type CopyBlock } from '../content/microcopy';
import { calculateBrandedMetrics, type BrandedMetrics } from '../utils/brandedMetricsEngine';
import { getBaselineStatus, getBaselineMetrics, type BaselineStatus } from '../utils/baselineMetrics';
import { getTrendAnalysis, getTrendHistory } from '../utils/trendTracking';
import { generateInsights, type Insight } from '../utils/insightsEngine';
import { analyzeRecordingMilestones, selectMilestoneCopyKey, type MilestoneSignals } from '../utils/progressSignals';
import { evaluateProgressNotifications } from '../services/progressNotifications';
import MaterialCard from '../components/MaterialCard';
import { InsightsCard } from '../components/InsightsCard';
import { getBrandedMetricDetails, type BrandedMetricName } from '../utils/brandedMetricsEngine';
import { LargeTitleHeader } from '../components/LargeTitleHeader';
import { DesignTokens } from '../design/tokens';
import { Typography } from '../design/typography';
import { LoadingSpinner } from '../components/LoadingSpinner';

import { NavigationBar } from '../components/NavigationBar';
import SFSymbol from '../components/SFSymbol';
import type { HistoryStackParamList } from '../navigation/types';


type RecordingsListScreenProps = NativeStackScreenProps<HistoryStackParamList, 'RecordingsList'>;

const RecordingListItem = React.memo(({
  item,
  index,
  onPress,
  onDelete
}: {
  item: StoredRecording;
  index: number;
  onPress: (recording: StoredRecording) => void;
  onDelete: (recording: StoredRecording) => void;
}) => {
  const brandedMetrics =
    item.newAverageBrandedMetrics ??
    (item.averageMetrics ? calculateBrandedMetrics(item.averageMetrics) : null);

  // Simple entrance animation
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      delay: index * 50, // Stagger effect
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY }],
      }}
    >
      <TouchableOpacity
        testID="recording-card"
        style={styles.recordingCard}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.recordingInfo}>
          <Text style={styles.recordingName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.processingStatus === 'processing' ? (
            <View style={styles.processingBadge}>
              <Text style={styles.processingText}>Processing metrics…</Text>
            </View>
          ) : null}
          {brandedMetrics && item.processingStatus !== 'processing' && (
            <View style={styles.voiceIqRow}>
              <View>
                <Text style={styles.voiceIqLabel}>Voice IQ™</Text>
                <Text style={styles.voiceIqScore}>{Math.round(brandedMetrics.voiceIQ)}</Text>
              </View>
              <Text style={styles.voiceIqDescriptor}>
                {getBrandedMetricDetails('voiceIQ', brandedMetrics.voiceIQ).label}
              </Text>
            </View>
          )}
          <Text style={styles.recordingDetails}>
            {formatDate(item.timestamp)} • {formatTime(item.duration)}
          </Text>
          {item.location?.formattedAddress && (
            <Text style={styles.recordingLocation} numberOfLines={1}>
              <SFSymbol name="location.fill" /> {item.location.formattedAddress}
            </Text>
          )}
          {brandedMetrics && (
            <View style={styles.metricsPreview}>
              {getTopMetrics(brandedMetrics).map((metric) => (
                <MetricBadge key={metric.key} metric={metric.key} score={metric.value} />
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity
          testID="delete-button"
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
        >
          <SFSymbol name="trash" style={{ color: 'white' }} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default function RecordingsListScreen({ navigation }: RecordingsListScreenProps) {
  const [recordings, setRecordings] = useState<StoredRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [milestoneCopy, setMilestoneCopy] = useState<CopyBlock | null>(null);
  const [milestoneSignals, setMilestoneSignals] = useState<MilestoneSignals | null>(null);
  const [baselineStatus, setBaselineStatus] = useState<BaselineStatus | null>(null);
  const behavioralPrompts: Array<{ key: string; copy: CopyBlock }> = [];
  const addPrompt = (key: string, copy: CopyBlock) => {
    if (!behavioralPrompts.some(prompt => prompt.key === key)) {
      behavioralPrompts.push({ key, copy });
    }
  };

  const loadRecordings = useCallback(async () => {
    try {
      const data = await getAllRecordings();
      const sorted = data.sort((a, b) => b.timestamp - a.timestamp);
      setRecordings(sorted);
      const signals = analyzeRecordingMilestones(sorted);
      setMilestoneSignals(signals);
      const milestoneKey = selectMilestoneCopyKey(signals);
      setMilestoneCopy(milestoneKey ? getMilestoneMessage(milestoneKey) : null);
      const status = await getBaselineStatus();
      setBaselineStatus(status);
      evaluateProgressNotifications(signals, status).catch(error =>
        logger.debug('Progress notification sync failed', error)
      );
    } catch (error) {
      logger.error('Error loading recordings:', error);
      logger.test('Failed to load recordings', error);
    } finally {
      setLoading(false);
      logger.test('Finished loading recordings');
    }
  }, []);

  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

  const daysSinceLast = milestoneSignals?.daysSinceLastRecording;
  if (typeof daysSinceLast === 'number' && daysSinceLast >= 4) {
    addPrompt('whisperWarning', getCoachingCopy('whisperWarning'));
  }

  if ((milestoneSignals?.streakDays ?? 0) >= 3) {
    addPrompt('vocalNap', getCoachingCopy('vocalNap'));
  }

  if (milestoneSignals?.latestMetrics && milestoneSignals.latestMetrics.health < 65) {
    addPrompt('hydrationBoost', getCoachingCopy('hydrationBoost'));
  }

  if (milestoneSignals?.latestMetrics && milestoneSignals.latestMetrics.clarity < 55) {
    addPrompt('throatClearing', getCoachingCopy('throatClearing'));
  }

  const latestBrandedMetrics = useMemo(() => {
    const latest = recordings[0];
    if (!latest) return null;
    if (latest.newAverageBrandedMetrics) return latest.newAverageBrandedMetrics;
    if (latest.averageMetrics) return calculateBrandedMetrics(latest.averageMetrics);
    return null;
  }, [recordings]);

  useEffect(() => {
    if (recordings.length === 0) {
      setInsights([]);
      return;
    }

    let isMounted = true;
    async function loadInsights() {
      try {
        const latestRecording = recordings[0];
        if (!latestRecording?.averageMetrics) {
          setInsights([]);
          return;
        }

        const latestMetrics = calculateBrandedMetrics(latestRecording.averageMetrics);
        const [baseline, trendAnalysis, history] = await Promise.all([
          getBaselineMetrics(),
          getTrendAnalysis(),
          getTrendHistory(30),
        ]);
        if (baseline) {
          setBaselineStatus((prev) =>
            prev && prev.isEstablished
              ? prev
              : {
                isEstablished: true,
                recordingCount: baseline.recordingCount,
                remainingCount: 0,
                progress: 100,
              },
          );
        }

        const generated = generateInsights({
          latestMetrics,
          baseline: baseline || null,
          trendAnalysis,
          history,
        });

        if (isMounted) {
          setInsights(generated);
        }
      } catch (error) {
        logger.warn('Failed to load insights', error);
      }
    }

    loadInsights();
    return () => {
      isMounted = false;
    };
  }, [recordings]);

  const handleDelete = useCallback((recording: StoredRecording) => {
    Alert.alert(
      'Delete Recording',
      `Are you sure you want to delete "${recording.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecording(recording.id);
              await loadRecordings();
            } catch (error) {
              logger.error('Error deleting recording:', error);
              Alert.alert('Error', 'Failed to delete recording');
            }
          },
        },
      ]
    );
  }, [loadRecordings]);

  const handleRecordingPress = useCallback((recording: StoredRecording) => {
    if (recording.processingStatus === 'processing') {
      Alert.alert('Processing', 'Hold on while we finish analyzing this session.');
      return;
    }
    navigation.navigate('RecordingDetails', { recording });
  }, [navigation]);

  const renderRecording = useCallback(({ item, index }: { item: StoredRecording; index: number }) => {
    return (
      <RecordingListItem
        item={item}
        index={index}
        onPress={handleRecordingPress}
        onDelete={handleDelete}
      />
    );
  }, [handleRecordingPress, handleDelete]);

  const renderEmpty = () => {
    const copy = getEmptyStateCopy('noRecordings');
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎤</Text>
        <Text style={styles.emptyTitle}>{copy.title}</Text>
        <Text style={styles.emptySubtitle}>{copy.body}</Text>
        {copy.helper && <Text style={styles.emptyHelper}>{copy.helper}</Text>}
      </View>
    );
  };

  const renderBehaviorCard = (entry: { key: string; copy: CopyBlock }) => (
    <MaterialCard key={entry.key} style={styles.behaviorCard} variant="solid-flat">
      <Text style={styles.behaviorEyebrow}>Care tip</Text>
      <Text style={styles.behaviorTitle}>{entry.copy.title}</Text>
      <Text style={styles.behaviorBody}>{entry.copy.body}</Text>
      {entry.copy.helper && <Text style={styles.behaviorHelper}>{entry.copy.helper}</Text>}
      {entry.copy.tags && (
        <View style={styles.tagRow}>
          {entry.copy.tags.map(tag => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </MaterialCard>
  );

  const ListHeader = (
    <View>
      {latestBrandedMetrics && (
        <MaterialCard style={styles.voiceSummaryCard} variant="glass-regular">
          <Text style={styles.voiceSummaryEyebrow}>Latest session</Text>
          <View style={styles.voiceSummaryRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.voiceIqLabel}>Voice IQ™</Text>
              <View style={styles.voiceIqHero}>
                <Text style={styles.voiceIqScore}>{Math.round(latestBrandedMetrics.voiceIQ)}</Text>
                <Text style={styles.voiceIqDescriptor}>
                  {getBrandedMetricDetails('voiceIQ', latestBrandedMetrics.voiceIQ).label}
                </Text>
              </View>
              <Text style={styles.voiceSummaryHelper}>Pulled from your most recent recording.</Text>
            </View>
            <View style={styles.voiceSummaryMetrics}>
              {getTopMetrics(latestBrandedMetrics, 2).map((metric) => (
                <View key={metric.key} style={styles.voiceSummaryMetric}>
                  <Text style={styles.voiceSummaryMetricLabel}>
                    {getBrandedMetricDetails(metric.key, metric.value).icon} {metric.key.charAt(0).toUpperCase() + metric.key.slice(1)}
                  </Text>
                  <Text style={styles.voiceSummaryMetricValue}>{Math.round(metric.value)}</Text>
                </View>
              ))}
            </View>
          </View>
        </MaterialCard>
      )}

      {baselineStatus && !baselineStatus.isEstablished && (
        <MaterialCard style={styles.baselineCard} variant="glass-regular">
          <Text style={styles.baselineEyebrow}>Baseline progress</Text>
          <Text style={styles.baselineTitle}>
            Record {baselineStatus.remainingCount} more session{baselineStatus.remainingCount === 1 ? '' : 's'}
          </Text>
          <Text style={styles.baselineBody}>Five recordings lock in your natural range.</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${baselineStatus.progress}%` }]} />
          </View>
          <Text style={styles.progressMeta}>{baselineStatus.recordingCount} / 5 sessions logged</Text>
        </MaterialCard>
      )}

      {baselineStatus?.isEstablished && (
        <MaterialCard style={styles.baselineCard} variant="glass-regular">
          <Text style={styles.baselineEyebrow}>Baseline locked</Text>
          <Text style={styles.baselineTitle}>Every new session compares to your signature.</Text>
          <Text style={styles.baselineBody}>
            Keep up a steady cadence to see deltas vs. your calibrated range.
          </Text>
        </MaterialCard>
      )}

      {milestoneCopy && (
        <MaterialCard style={styles.milestoneCard} variant="solid-flat">
          <Text style={styles.milestoneEyebrow}>Momentum</Text>
          <Text style={styles.milestoneTitle}>{milestoneCopy.title}</Text>
          <Text style={styles.milestoneBody}>{milestoneCopy.body}</Text>
          {milestoneCopy.helper && (
            <Text style={styles.milestoneHelper}>{milestoneCopy.helper}</Text>
          )}
          {milestoneSignals?.personalBest && milestoneSignals.personalBestValue && (
            <Text style={styles.milestoneMeta}>
              Voice IQ™ {milestoneSignals.personalBestValue}
            </Text>
          )}
          {typeof milestoneSignals?.daysSinceLastRecording === 'number' &&
            milestoneSignals.daysSinceLastRecording >= 5 && (
              <Text style={styles.milestoneMeta}>
                {`It’s been ${milestoneSignals.daysSinceLastRecording} day${milestoneSignals.daysSinceLastRecording === 1 ? '' : 's'
                  } since your last check-in.`}
              </Text>
            )}
        </MaterialCard>
      )}

      {behavioralPrompts.map(renderBehaviorCard)}

      {insights.length > 0 && (
        <InsightsCard
          insights={insights}
          title="Insights"
          subtitle="Based on your latest sessions"
          style={styles.insightsCard}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={DesignTokens.isDarkMode ? 'light-content' : 'dark-content'} translucent />
      <NavigationBar
        title="Recordings"
        leftSlot={
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <SFSymbol name="chevron.backward" style={styles.backButtonIcon} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        }
      />
      <FlatList
        data={recordings}
        renderItem={renderRecording}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={[
          styles.listContent,
          recordings.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner size={40} />
              <Text style={styles.loadingText}>Loading recordings...</Text>
            </View>
          ) : (
            renderEmpty
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}



// ... (rest of imports)

function MetricBadge({ metric, score }: { metric: BrandedMetricName; score?: number }) {
  const details = getBrandedMetricDetails(metric, score ?? 0);

  if (typeof score !== 'number') {
    return (
      <View style={styles.metricBadge}>
        <Text style={styles.metricLabel}>
          {details.icon} {metric.charAt(0).toUpperCase() + metric.slice(1)}
        </Text>
        <Text style={styles.metricPlaceholder}>—</Text>
      </View>
    );
  }

  return (
    <View style={[styles.metricBadge, { borderColor: `${details.color}33` }]}>
      <View style={styles.metricBadgeHeader}>
        <Text style={styles.metricLabel}>
          {details.icon} {metric.charAt(0).toUpperCase() + metric.slice(1)}
        </Text>
        <Text style={[styles.metricValue, { color: details.color }]}>{Math.round(score)}</Text>
      </View>
      <Text style={[styles.metricDescriptor, { color: details.color }]}>{details.label}</Text>
    </View>
  );
}

const CORE_METRICS: BrandedMetricName[] = ['clarity', 'power', 'health', 'warmth', 'confidence', 'expressiveness'];

function getTopMetrics(metrics: BrandedMetrics, count = 2) {
  return CORE_METRICS
    .map((key) => ({ key, value: metrics[key] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, count);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.bgPrimary,
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
  voiceSummaryCard: {
    marginHorizontal: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.sm,
    gap: DesignTokens.spacing.sm,
  },
  voiceSummaryEyebrow: {
    ...Typography.caption2,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: DesignTokens.colors.textSecondary,
  },
  voiceSummaryRow: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.md,
  },
  voiceSummaryHelper: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
  },
  voiceSummaryMetrics: {
    flex: 1,
    gap: DesignTokens.spacing.xs,
  },
  voiceSummaryMetric: {
    padding: DesignTokens.spacing.sm,
    borderRadius: DesignTokens.radii.md,
    backgroundColor: DesignTokens.isDarkMode
      ? 'rgba(255,255,255,0.08)'
      : 'rgba(0,0,0,0.04)',
  },
  voiceSummaryMetricLabel: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
    marginBottom: 4,
  },
  voiceSummaryMetricValue: {
    ...Typography.title2,
    color: DesignTokens.colors.textPrimary,
  },
  baselineCard: {
    marginHorizontal: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.sm,
    gap: 6,
  },
  baselineEyebrow: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  baselineTitle: {
    ...Typography.title2,
    color: DesignTokens.colors.textPrimary,
  },
  baselineBody: {
    ...Typography.body,
    color: DesignTokens.colors.textSecondary,
  },
  progressTrack: {
    marginTop: 6,
    height: 6,
    borderRadius: DesignTokens.radii.pill,
    backgroundColor: DesignTokens.isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: DesignTokens.radii.pill,
    backgroundColor: DesignTokens.colors.tint,
  },
  progressMeta: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
  },
  milestoneCard: {
    marginHorizontal: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.sm,
    gap: 6,
  },
  milestoneEyebrow: {
    ...Typography.caption2,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: DesignTokens.colors.textSecondary,
  },
  milestoneTitle: {
    ...Typography.title2,
    color: DesignTokens.colors.textPrimary,
  },
  milestoneBody: {
    ...Typography.body,
    color: DesignTokens.colors.textSecondary,
  },
  milestoneHelper: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
  },
  milestoneMeta: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
  },
  behaviorCard: {
    marginHorizontal: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.sm,
    gap: 4,
  },
  behaviorEyebrow: {
    ...Typography.caption2,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: DesignTokens.colors.textSecondary,
  },
  behaviorTitle: {
    ...Typography.title2,
    color: DesignTokens.colors.textPrimary,
  },
  behaviorBody: {
    ...Typography.body,
    color: DesignTokens.colors.textSecondary,
  },
  behaviorHelper: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: DesignTokens.radii.pill,
    borderWidth: 1,
    borderColor: DesignTokens.isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
  },
  tagText: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  insightsCard: {
    marginHorizontal: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.sm,
  },
  listContent: {
    paddingTop: 52, // NavigationBar height
    paddingBottom: DesignTokens.spacing.md,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  recordingCard: {
    backgroundColor: DesignTokens.colors.bgCard,
    borderRadius: DesignTokens.radii.lg,
    padding: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.sm,
    marginHorizontal: DesignTokens.spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        shadowOpacity: 1,
      },
      android: {
        elevation: 2,
      },
    }),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordingInfo: {
    flex: 1,
    gap: 6,
  },
  recordingName: {
    ...Typography.title2,
    color: DesignTokens.colors.textPrimary,
  },
  recordingDetails: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
  },
  recordingLocation: {
    ...Typography.caption2,
    color: DesignTokens.colors.tint,
  },
  voiceIqHero: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: DesignTokens.spacing.xs,
  },
  metricsPreview: {
    flexDirection: 'column',
    gap: DesignTokens.spacing.xs,
    marginTop: DesignTokens.spacing.sm,
  },
  voiceIqRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 4,
  },
  voiceIqLabel: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  voiceIqScore: {
    ...Typography.title2,
    color: DesignTokens.colors.textPrimary,
  },
  voiceIqDescriptor: {
    ...Typography.body,
    fontWeight: '600',
    color: DesignTokens.colors.tint,
  },
  processingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: DesignTokens.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    borderRadius: DesignTokens.radii.pill,
    paddingHorizontal: DesignTokens.spacing.sm,
    paddingVertical: DesignTokens.spacing.xxs,
    marginBottom: 4,
  },
  processingText: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
    fontWeight: '600',
  },
  metricBadge: {
    paddingVertical: DesignTokens.spacing.sm,
    paddingHorizontal: DesignTokens.spacing.sm,
    borderRadius: DesignTokens.radii.md,
    borderWidth: 1,
    backgroundColor: DesignTokens.colors.bgPrimary,
    gap: 4,
  },
  metricBadgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
  },
  metricValue: {
    ...Typography.title2,
  },
  metricDescriptor: {
    ...Typography.caption2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricPlaceholder: {
    ...Typography.title2,
    color: DesignTokens.colors.textSecondary,
  },
  deleteButton: {
    padding: DesignTokens.spacing.sm,
    backgroundColor: DesignTokens.colors.error,
    borderRadius: DesignTokens.radii.pill,
    marginLeft: DesignTokens.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    ...Typography.title2,
    color: DesignTokens.colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...Typography.body,
    color: DesignTokens.colors.textSecondary,
    textAlign: 'center',
  },
  emptyHelper: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: DesignTokens.spacing.md,
  },
  loadingText: {
    ...Typography.body,
    color: DesignTokens.colors.textSecondary,
  },
});
