import type { BrandedMetrics } from '../utils/brandedMetricsEngine';
import type { MetricKey } from './metricEducation';

export interface CopyBlock {
  title: string;
  body: string;
  helper?: string;
}

type EmptyStateKey = 'firstRecording' | 'noRecordings' | 'noBaseline';
type MilestoneKey = 'streak3' | 'streak7' | 'personalBest' | 'allHealthy';
type CoachingKey = 'lowPower' | 'greatClarity' | 'lowHealth';

const emptyStates: Record<EmptyStateKey, CopyBlock> = {
  firstRecording: {
    title: 'Your voice has a story.',
    body: 'Ready for the next chapter? Tap record to capture your natural tone.',
    helper: 'Keep it simple—30 seconds is enough for a baseline reading.',
  },
  noRecordings: {
    title: 'Tap record to discover your vocal signature.',
    body: 'Each session unlocks richer insights and more precise coaching.',
    helper: 'Need inspiration? Start with a journal entry or warmup phrase.',
  },
  noBaseline: {
    title: 'Building your vocal baseline',
    body: 'Record 5 sessions so we can learn your natural range and trends.',
    helper: 'Consistency matters more than length—short check-ins count.',
  },
};

const milestoneMessages: Record<MilestoneKey, CopyBlock> = {
  streak3: {
    title: '3 days strong.',
    body: 'Consistency is power. Keep the streak alive tomorrow.',
    helper: 'A 30-second check-in qualifies—keep it light.',
  },
  streak7: {
    title: '7-day resilience streak.',
    body: "You've kept your voice healthy for a full week.",
    helper: 'Bookmark what worked—sleep, hydration, warmups.',
  },
  personalBest: {
    title: 'New personal best!',
    body: 'Your latest session just set a new high score.',
    helper: 'Capture what felt different so you can repeat it.',
  },
  allHealthy: {
    title: 'Resilience streak unlocked.',
    body: 'All six metrics stayed in the healthy range.',
    helper: 'Balance like this keeps your voice ready on any day.',
  },
};

const coachingMessages: Record<CoachingKey, CopyBlock> = {
  lowPower: {
    title: 'Power could use support.',
    body: 'Warm up with a few breath-to-voice slides before the next session.',
    helper: 'Think “lift through the ribs” instead of pushing from the throat.',
  },
  greatClarity: {
    title: 'Clarity is shining.',
    body: 'Your articulation is sharp and easy to follow.',
    helper: 'Keep hydration nearby to maintain that precision.',
  },
  lowHealth: {
    title: 'Health dipped below your norm.',
    body: 'Consider rest, steam, or straw phonation to reset.',
    helper: 'Ease up for a day so your instrument can rebound.',
  },
};

export function getEmptyStateCopy(key: EmptyStateKey): CopyBlock {
  return emptyStates[key];
}

export function getMilestoneMessage(key: MilestoneKey): CopyBlock {
  return milestoneMessages[key];
}

export function getCoachingCopy(key: CoachingKey): CopyBlock {
  return coachingMessages[key];
}

export function getPostRecordingInsight(metrics?: BrandedMetrics | null): CopyBlock {
  if (!metrics) {
    return {
      title: 'Session saved.',
      body: 'Review your Voice IQ™ to see what stood out.',
      helper: 'Tap any metric to learn how it affects your sound.',
    };
  }

  if (metrics.health < 55) {
    return {
      title: `Health ${metrics.health}. Go gentle today.`,
      body: 'Your instrument is asking for rest and hydration.',
      helper: 'Short vocal breaks or light straw phonation can help reset.',
    };
  }

  if (metrics.voiceIQ >= 85) {
    return {
      title: `Voice IQ™ ${metrics.voiceIQ}. Quietly powerful.`,
      body: 'Whatever prep you did today is working—mark it down.',
      helper: 'Try to repeat the same routine before the next important session.',
    };
  }

  const metricEntries: Array<{ key: MetricKey; score: number; label: string }> = [
    { key: 'clarity', score: metrics.clarity, label: 'Clarity' },
    { key: 'power', score: metrics.power, label: 'Power' },
    { key: 'health', score: metrics.health, label: 'Health' },
    { key: 'warmth', score: metrics.warmth, label: 'Warmth' },
    { key: 'confidence', score: metrics.confidence, label: 'Confidence' },
    { key: 'expressiveness', score: metrics.expressiveness, label: 'Expressiveness' },
  ];

  const strongest = metricEntries.reduce((best, current) =>
    current.score > best.score ? current : best
  );

  if (strongest.key === 'clarity' && strongest.score >= 80) {
    return {
      title: `Clarity ${strongest.score}. Your voice cuts through.`,
      body: 'Listeners will catch every detail when you sound this precise.',
      helper: 'Log what you changed—warmups, mic distance, or environment.',
    };
  }

  if (strongest.key === 'power' && strongest.score >= 75) {
    return {
      title: `Power ${strongest.score}. Solid projection.`,
      body: 'You held energy without forcing. That balance keeps fatigue low.',
      helper: 'Sustain it with rib expansion breaths between takes.',
    };
  }

  if (metrics.expressiveness >= 75) {
    return {
      title: `Expressiveness ${metrics.expressiveness}. Stories feel alive.`,
      body: 'You varied pitch and intensity enough to keep attention high.',
      helper: 'Tag the moments that worked so you can reuse the arc.',
    };
  }

  return {
    title: 'Consistency is building.',
    body: `Voice IQ™ ${metrics.voiceIQ}. Keep stacking short sessions to raise the floor.`,
    helper: 'Tomorrow, aim for the same ritual—steady inputs build steady outputs.',
  };
}
