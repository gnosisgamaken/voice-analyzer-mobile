import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import WaveformView from '../components/WaveformView';
import RecordingControls from '../components/RecordingControls';
import { BrandedMetricCard, VoiceIQDisplay } from '../components/BrandedMetricCard';
import { VoiceSample } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RecorderStackParamList, RootTabParamList } from '../navigation/types';
import { MaterialCard } from '../components/MaterialCard';
import { LiquidGlassView } from '../components/LiquidGlassView';
import { getBaselineStatus, type BaselineStatus } from '../utils/baselineMetrics';
import { MetricExplanationModal } from '../components/MetricExplanationModal';
import type { MetricKey } from '../content/metricEducation';
import {
  getEmptyStateCopy,
  getPostRecordingInsight,
  getMilestoneMessage,
  getCoachingCopy,
  type CopyBlock,
} from '../content/microcopy';
import {
  scheduleNotification,
  buildGentleReminderPayload,
  buildCelebrationPayload,
} from '../services/notificationService';
import { logger } from '../utils/logger';
import { getAllRecordings } from '../utils/storage';
import { analyzeRecordingMilestones, selectMilestoneCopyKey, type MilestoneSignals } from '../utils/progressSignals';
import { LargeTitleHeader } from '../components/LargeTitleHeader';
import { DesignTokens } from '../design/tokens';
import { Typography } from '../design/typography';

import SFSymbol from '../components/SFSymbol';
import { LiquidGlassButton } from '../components/LiquidGlassButton';

const HERO_ICON = require('../../assets/my-voice.png');

type BehaviorCard = {
  key: string;
  copy: CopyBlock;
  actionLabel?: string;
  onAction?: () => void;
  eyebrow?: string;
};

type MainRecordingScreenProps = NativeStackScreenProps<RecorderStackParamList, 'MainRecording'>;

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

const HEADER_MAX_HEIGHT = 120;

export default function MainRecordingScreen({ navigation }: MainRecordingScreenProps) {
  const tabNavigation = navigation.getParent<BottomTabNavigationProp<RootTabParamList>>();
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const windowDimensions = useWindowDimensions();
  
  const heroHeight = useMemo(() => {
    const availableHeight = windowDimensions.height - insets.top - insets.bottom;
    return Math.max(0, Math.round(availableHeight * 0.75));
  }, [windowDimensions.height, insets.top, insets.bottom]);
  
  const scrollContentStyle = useMemo(() => ({
    paddingTop: HEADER_MAX_HEIGHT + insets.top,
    paddingHorizontal: DesignTokens.spacing.md,
    paddingBottom: DesignTokens.spacing.xl,
    gap: DesignTokens.spacing.lg,
  }), [insets.top]);

  const {
    recordingState,
    currentSample,
    duration,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    analysisMode,
    measurementWarnings,
  } = useAudioRecorder();

  const [samples, setSamples] = useState<VoiceSample[]>([]);
  const [baselineStatus, setBaselineStatus] = useState<BaselineStatus | null>(null);
  const lastNotificationSession = useRef<number | null>(null);
  const [milestoneCopy, setMilestoneCopy] = useState<CopyBlock | null>(null);
  const [milestoneSignals, setMilestoneSignals] = useState<MilestoneSignals | null>(null);
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false);

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
  const baselineMilestoneCopy = getMilestoneMessage('baselineComplete');

  const openMetricModal = (metricKey: MetricKey, score?: number) => {
    setEducationModal({ metricKey, score });
  };

  const closeMetricModal = () => setEducationModal(null);

  const handleStartVocalNap = useCallback(async () => {
    try {
      await scheduleNotification({
        type: 'gentleReminder',
        title: 'Vocal nap complete',
        body: 'Ease back in with a light hum when the timer ends.',
        scheduleAt: Date.now() + 10 * 60 * 1000,
      });
      Alert.alert('Timer set', 'We will remind you in 10 minutes.');
    } catch (error) {
      logger.debug('Vocal nap timer scheduling failed', error);
      Alert.alert('Reminder not scheduled', 'Enable notifications to get nap alerts.');
    }
  }, []);

  const refreshMilestones = useCallback(async () => {
    try {
      const recordings = await getAllRecordings();
      if (!recordings.length) {
        setMilestoneCopy(null);
        setMilestoneSignals(null);
        return;
      }
      const signals = analyzeRecordingMilestones(recordings);
      setMilestoneSignals(signals);
      const key = selectMilestoneCopyKey(signals);
      setMilestoneCopy(key ? getMilestoneMessage(key) : null);
    } catch (error) {
      logger.debug('Failed to load milestone signals', error);
    }
  }, []);

  useEffect(() => {
    refreshMilestones();
  }, [recordingState, refreshMilestones]);

  const behaviorCards: BehaviorCard[] = [];
  const measurementWarningSet = new Set(measurementWarnings);

  if (analysisMode === 'simulated') {
    behaviorCards.push({
      key: 'measurementSimulated',
      copy: getCoachingCopy('measurementSimulated'),
      eyebrow: 'Measurement quality',
    });
  }

  if (measurementWarningSet.has('lowSampleRate')) {
    behaviorCards.push({
      key: 'measurementLowSampleRate',
      copy: getCoachingCopy('measurementLowSampleRate'),
      eyebrow: 'Measurement quality',
    });
  }

  const shouldShowVocalNapCard =
    recordingState === 'stopped' &&
    (duration >= 60 || (milestoneSignals?.streakDays ?? 0) >= 3 || (brandedMetrics && brandedMetrics.health < 55));
  const shouldShowHydrationCard = Boolean(brandedMetrics && brandedMetrics.health < 65);
  const shouldShowThroatCard = Boolean(brandedMetrics && brandedMetrics.clarity < 55);
  const shouldWarnWhisper = Boolean(brandedMetrics && brandedMetrics.health < 50);

  if (shouldShowVocalNapCard) {
    behaviorCards.push({
      key: 'vocalNap',
      copy: getCoachingCopy('vocalNap'),
      actionLabel: 'Start 10-min timer',
      onAction: handleStartVocalNap,
    });
  }

  if (shouldShowHydrationCard) {
    behaviorCards.push({
      key: 'hydration',
      copy: getCoachingCopy('hydrationBoost'),
    });
  }

  if (shouldShowThroatCard) {
    behaviorCards.push({
      key: 'throatClearing',
      copy: getCoachingCopy('throatClearing'),
    });
  }

  if (shouldWarnWhisper) {
    behaviorCards.push({
      key: 'whisperWarning',
      copy: getCoachingCopy('whisperWarning'),
    });
  }

  useEffect(() => {
    if (recordingState !== 'stopped' || !brandedMetrics) return;
    const sessionKey = currentSample?.timestamp ?? Date.now();
    if (lastNotificationSession.current === sessionKey) {
      return;
    }
    lastNotificationSession.current = sessionKey;

    (async () => {
      try {
        await scheduleNotification(buildGentleReminderPayload(Date.now()));
      } catch (error) {
        logger.debug('Gentle reminder scheduling skipped', error);
      }
      if (brandedMetrics.voiceIQ >= 85) {
        try {
          await scheduleNotification(buildCelebrationPayload('Voice IQ™', brandedMetrics.voiceIQ));
        } catch (error) {
          logger.debug('Celebration notification skipped', error);
        }
      }
    })();
  }, [recordingState, brandedMetrics, currentSample?.timestamp]);

  const headerActions = (
    <View style={styles.headerActions}>
      <TouchableOpacity onPress={() => navigation.navigate('BrandedMetricsDemo')}>
        <SFSymbol name="sparkles" style={styles.headerIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => tabNavigation?.navigate('NotificationsStack')}>
        <SFSymbol name="bell" style={styles.headerIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => tabNavigation?.navigate('HistoryStack')}>
        <SFSymbol name="list.bullet" style={styles.headerIcon} />
      </TouchableOpacity>
    </View>
  );

  const heroChips: string[] = [];
  if (baselineStatus) {
    heroChips.push(
      baselineStatus.isEstablished
        ? 'Baseline locked'
        : `Baseline ${baselineStatus.recordingCount}/5`,
    );
  }
  heroChips.push(analysisMode === 'simulated' ? 'Simulated metrics' : 'Live analyzer');
  if (recordingState === 'recording') {
    heroChips.push('Streaming now');
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle={DesignTokens.isDarkMode ? 'light-content' : 'dark-content'} translucent />
      <LargeTitleHeader
        title="Record"
        scrollOffsetY={scrollOffsetY}
        trailingActions={headerActions}
      />
      <Animated.ScrollView
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {Platform.OS === 'android' && (
          <View style={styles.androidNotice}>
            <Text style={styles.androidNoticeText}>
              Android support is in beta. For full voice analysis, iOS is recommended.
            </Text>
          </View>
        )}

        {brandedMetrics && (
          <View style={[styles.heroSection, { minHeight: heroHeight }]}>
            <VoiceIQDisplay
              score={brandedMetrics.voiceIQ}
              style={styles.voiceIQHero}
              isHero={true}
              onLearnMore={() => openMetricModal('voiceIQ', brandedMetrics.voiceIQ)}
            />
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setShowDetailedMetrics(!showDetailedMetrics)}
              accessibilityLabel={showDetailedMetrics ? 'Hide detailed metrics' : 'Show detailed metrics'}
            >
              <Text style={styles.expandButtonText}>
                {showDetailedMetrics ? 'Hide Details' : 'View All Metrics'}
              </Text>
              <SFSymbol
                name={showDetailedMetrics ? 'chevron.up' : 'chevron.down'}
                style={styles.expandIcon}
              />
            </TouchableOpacity>
          </View>
        )}

        {brandedMetrics && showDetailedMetrics && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Detailed Breakdown</Text>
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

        <LiquidGlassView style={styles.heroCard} contentStyle={styles.heroContent}>
          <View style={styles.heroHeader}>
            <Image source={HERO_ICON} style={styles.heroIcon} resizeMode="contain" />
            <View style={styles.heroStatus}>
              <View style={styles.heroEyebrowRow}>
                <Text style={styles.heroEyebrow}>{sessionCopy.eyebrow}</Text>
                <View style={styles.heroDot} />
              </View>
              <Text style={styles.heroTitle}>Voice Analyzer</Text>
              <Text style={styles.heroSubtitle}>{sessionCopy.subtitle}</Text>
            </View>
          </View>
          <Text style={styles.heroHelper}>{sessionCopy.helper}</Text>
          {heroChips.length > 0 && (
            <View style={styles.heroChips}>
              {heroChips.map((chip) => (
                <View key={chip} style={styles.heroChip}>
                  <Text style={styles.heroChipText}>{chip}</Text>
                </View>
              ))}
            </View>
          )}
        </LiquidGlassView>

        <LiquidGlassView style={styles.waveformCard} contentStyle={styles.waveContent}>
          <Text style={styles.sectionLabel}>Live spectrum</Text>
          <WaveformView samples={waveformSamples} height={170} />
        </LiquidGlassView>

        <RecordingControls
          recordingState={recordingState}
          duration={duration}
          onStart={startRecording}
          onPause={pauseRecording}
          onResume={resumeRecording}
          onStop={stopRecording}
        />

        {showFirstRecordingCard && (
          <MaterialCard style={styles.guidanceCard} variant="glass-regular">
            <Text style={styles.guidanceEyebrow}>Welcome</Text>
            <Text style={styles.guidanceTitle}>{firstRecordingCopy.title}</Text>
            <Text style={styles.guidanceBody}>{firstRecordingCopy.body}</Text>
            {firstRecordingCopy.helper && (
              <Text style={styles.guidanceHelper}>{firstRecordingCopy.helper}</Text>
            )}
          </MaterialCard>
        )}

        {showBaselineCard && baselineStatus && (
          <MaterialCard style={styles.guidanceCard} variant="glass-regular">
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

        {baselineStatus?.isEstablished && (
          <MaterialCard style={styles.guidanceCard} variant="glass-regular">
            <Text style={styles.guidanceEyebrow}>Milestone</Text>
            <Text style={styles.guidanceTitle}>{baselineMilestoneCopy.title}</Text>
            <Text style={styles.guidanceBody}>{baselineMilestoneCopy.body}</Text>
            {baselineMilestoneCopy.helper && (
              <Text style={styles.guidanceHelper}>{baselineMilestoneCopy.helper}</Text>
            )}
          </MaterialCard>
        )}

        {milestoneCopy && (
          <MaterialCard style={styles.guidanceCard} variant="glass-regular">
            <Text style={styles.guidanceEyebrow}>Momentum</Text>
            <Text style={styles.guidanceTitle}>{milestoneCopy.title}</Text>
            <Text style={styles.guidanceBody}>{milestoneCopy.body}</Text>
            {milestoneCopy.helper && (
              <Text style={styles.guidanceHelper}>{milestoneCopy.helper}</Text>
            )}
            {milestoneSignals?.personalBest && milestoneSignals.personalBestValue && (
              <Text style={styles.guidanceHelper}>
                Voice IQ™ {milestoneSignals.personalBestValue}
              </Text>
            )}
            {typeof milestoneSignals?.daysSinceLastRecording === 'number' &&
              milestoneSignals.daysSinceLastRecording >= 5 && (
                <Text style={styles.guidanceHelper}>
                  {`It’s been ${milestoneSignals.daysSinceLastRecording} day${
                    milestoneSignals.daysSinceLastRecording === 1 ? '' : 's'
                  } since your last check-in.`}
                </Text>
              )}
          </MaterialCard>
        )}

        {behaviorCards.map(renderBehaviorCard)}

        {recordingState === 'stopped' && postRecordingInsight && (
          <MaterialCard style={styles.insightCard} variant="solid-flat">
            <Text style={styles.insightEyebrow}>Post-recording insight</Text>
            <Text style={styles.insightTitle}>{postRecordingInsight.title}</Text>
            <Text style={styles.insightBody}>{postRecordingInsight.body}</Text>
            {postRecordingInsight.helper && (
              <Text style={styles.insightHelper}>{postRecordingInsight.helper}</Text>
            )}
          </MaterialCard>
        )}
      </Animated.ScrollView>
      <MetricExplanationModal
        visible={Boolean(educationModal)}
        metricKey={educationModal?.metricKey ?? null}
        score={educationModal?.score}
        onClose={closeMetricModal}
      />
    </View>
  );
}

const renderTags = (tags: string[]) => (
  <View style={styles.tagRow}>
    {tags.map(tag => (
      <View key={tag} style={styles.tagChip}>
        <Text style={styles.tagText}>{tag}</Text>
      </View>
    ))}
  </View>
);

const renderBehaviorCard = (card: BehaviorCard) => (
  <MaterialCard key={card.key} variant="glass-regular" style={styles.guidanceCard}>
    <Text style={styles.guidanceEyebrow}>{card.eyebrow ?? 'Care tip'}</Text>
    <Text style={styles.guidanceTitle}>{card.copy.title}</Text>
    <Text style={styles.guidanceBody}>{card.copy.body}</Text>
    {card.copy.helper && <Text style={styles.guidanceHelper}>{card.copy.helper}</Text>}
    {card.copy.tags && renderTags(card.copy.tags)}
    {card.onAction && card.actionLabel && (
      <LiquidGlassButton
        title={card.actionLabel}
        onPress={card.onAction}
        variant="tinted"
        size="small"
        hapticType="selection"
        style={styles.actionButtonWrapper}
      />
    )}
  </MaterialCard>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: DesignTokens.colors.bgPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.md,
  },
  headerIcon: {
    fontSize: 22,
    color: DesignTokens.colors.tint,
  },
  heroCard: {
  },
  heroContent: {
    gap: DesignTokens.spacing.sm,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.md,
  },
  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.05)',
    shadowColor: 'rgba(23,115,255,0.6)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  heroStatus: {
    flex: 1,
    gap: DesignTokens.spacing.xs,
  },
  heroEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
  },
  heroEyebrow: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
    letterSpacing: 1,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DesignTokens.colors.clarity,
  },
  heroTitle: {
    ...Typography.title2,
    color: DesignTokens.colors.textPrimary,
  },
  heroSubtitle: {
    ...Typography.body,
    color: DesignTokens.colors.textSecondary,
  },
  heroHelper: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
    marginTop: 4,
  },
  heroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing.xs,
    marginTop: DesignTokens.spacing.xs,
  },
  heroChip: {
    paddingHorizontal: DesignTokens.spacing.sm,
    paddingVertical: DesignTokens.spacing.xxs,
    borderRadius: DesignTokens.radii.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroChipText: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
  },
  waveformCard: {
  },
  waveContent: {
    gap: 12,
    paddingBottom: 4,
  },
  sectionLabel: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  guidanceCard: {
    gap: DesignTokens.spacing.xs,
  },
  guidanceEyebrow: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  guidanceTitle: {
    ...Typography.title2,
    color: DesignTokens.colors.textPrimary,
  },
  guidanceBody: {
    ...Typography.body,
    color: DesignTokens.colors.textSecondary,
  },
  guidanceHelper: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing.xs,
    marginTop: DesignTokens.spacing.xs,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: DesignTokens.radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  tagText: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  actionButton: {
    marginTop: DesignTokens.spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.xs,
    borderRadius: DesignTokens.radii.pill,
    backgroundColor: DesignTokens.colors.tint,
  },
  actionButtonText: {
    ...Typography.caption1,
    color: '#fff',
    fontWeight: '600',
  },
  actionButtonWrapper: {
    marginTop: DesignTokens.spacing.sm,
    alignSelf: 'flex-start',
  },
  baselineProgressTrack: {
    height: 6,
    backgroundColor: DesignTokens.isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
    borderRadius: DesignTokens.radii.pill,
    overflow: 'hidden',
    marginTop: DesignTokens.spacing.sm,
  },
  baselineProgressFill: {
    height: '100%',
    backgroundColor: DesignTokens.colors.tint,
    borderRadius: DesignTokens.radii.pill,
  },
  progressMeta: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
    marginTop: DesignTokens.spacing.xs,
  },
  section: {
    gap: DesignTokens.spacing.sm,
  },
  sectionHeader: {
    ...Typography.title2,
    color: DesignTokens.colors.textPrimary,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.xl,
  },
  voiceIQHero: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  voiceIQCard: {
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.sm,
    backgroundColor: DesignTokens.isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    borderRadius: DesignTokens.radii.pill,
  },
  expandButtonText: {
    ...Typography.body,
    color: DesignTokens.colors.tint,
    fontWeight: '600',
  },
  expandIcon: {
    width: 16,
    height: 16,
    tintColor: DesignTokens.colors.tint,
  },
  metricsGrid: {
    gap: DesignTokens.spacing.md,
  },
  insightCard: {
    gap: DesignTokens.spacing.xs,
  },
  insightEyebrow: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  insightTitle: {
    ...Typography.title2,
    color: DesignTokens.colors.textPrimary,
  },
  insightBody: {
    ...Typography.body,
    color: DesignTokens.colors.textSecondary,
  },
  insightHelper: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
  },
  androidNotice: {
    marginBottom: DesignTokens.spacing.md,
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
    backgroundColor: '#FFF3CD',
    borderRadius: DesignTokens.radii.md,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  androidNoticeText: {
    ...Typography.caption1,
    color: '#664D03',
    textAlign: 'center',
  },
});
