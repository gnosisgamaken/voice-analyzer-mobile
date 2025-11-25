import { calculateBrandedMetrics, type BrandedMetrics } from './brandedMetricsEngine';
import type { StoredRecording } from '../types';
import type { MilestoneKey } from '../content/microcopy';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface MilestoneSignals {
  streakDays: number;
  has3DayStreak: boolean;
  has7DayStreak: boolean;
  allHealthy: boolean;
  personalBest: boolean;
  personalBestValue?: number;
  daysSinceLastRecording: number | null;
  latestMetrics: BrandedMetrics | null;
  latestRecordingTimestamp: number | null;
}

const EMPTY_SIGNALS: MilestoneSignals = {
  streakDays: 0,
  has3DayStreak: false,
  has7DayStreak: false,
  allHealthy: false,
  personalBest: false,
  daysSinceLastRecording: null,
  latestMetrics: null,
  latestRecordingTimestamp: null,
};

export function analyzeRecordingMilestones(recordings: StoredRecording[]): MilestoneSignals {
  if (!recordings.length) {
    return EMPTY_SIGNALS;
  }

  const sorted = [...recordings].sort((a, b) => b.timestamp - a.timestamp);
  const latestRecording = sorted[0];
  const latestMetrics = latestRecording.averageMetrics
    ? calculateBrandedMetrics(latestRecording.averageMetrics)
    : null;

  const uniqueDays: number[] = [];
  const seen = new Set<number>();

  for (const recording of sorted) {
    const dayIndex = Math.floor(recording.timestamp / DAY_MS);
    if (seen.has(dayIndex)) continue;
    uniqueDays.push(dayIndex);
    seen.add(dayIndex);
  }

  let streakDays = 0;
  let previousDay: number | null = null;
  for (const day of uniqueDays) {
    if (previousDay === null) {
      streakDays = 1;
      previousDay = day;
      continue;
    }
    if ((previousDay ?? day) - day === 1) {
      streakDays += 1;
      previousDay = day;
    } else {
      break;
    }
  }

  let bestOtherVoiceIQ = 0;
  for (let i = 1; i < sorted.length; i += 1) {
    const metrics = sorted[i].averageMetrics
      ? calculateBrandedMetrics(sorted[i].averageMetrics)
      : null;
    if (metrics) {
      bestOtherVoiceIQ = Math.max(bestOtherVoiceIQ, metrics.voiceIQ);
    }
  }

  const personalBest =
    !!latestMetrics && latestMetrics.voiceIQ > bestOtherVoiceIQ;

  const allHealthy =
    !!latestMetrics &&
    ['clarity', 'power', 'health', 'warmth', 'confidence', 'expressiveness'].every(
      key => (latestMetrics as any)[key] >= 60
    );

  const daysSinceLastRecording = latestRecording.timestamp
    ? Math.floor((Date.now() - latestRecording.timestamp) / DAY_MS)
    : null;

  return {
    streakDays,
    has3DayStreak: streakDays >= 3,
    has7DayStreak: streakDays >= 7,
    allHealthy,
    personalBest,
    personalBestValue: latestMetrics?.voiceIQ,
    daysSinceLastRecording,
    latestMetrics,
    latestRecordingTimestamp: latestRecording.timestamp ?? null,
  };
}

export function selectMilestoneCopyKey(signals: MilestoneSignals): MilestoneKey | null {
  if (signals.has7DayStreak) return 'streak7';
  if (signals.has3DayStreak) return 'streak3';
  if (signals.personalBest) return 'personalBest';
  if (signals.allHealthy) return 'allHealthy';
  return null;
}
