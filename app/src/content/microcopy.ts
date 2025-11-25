import type { BrandedMetrics } from '../utils/brandedMetricsEngine';
import type { MetricKey } from './metricEducation';

export interface CopyBlock {
  title: string;
  body: string;
  helper?: string;
  tags?: string[];
}

type EmptyStateKey = 'firstRecording' | 'noRecordings' | 'noBaseline';
export type MilestoneKey = 'streak3' | 'streak7' | 'personalBest' | 'allHealthy' | 'baselineComplete';
type CoachingKey =
  | 'lowPower'
  | 'greatClarity'
  | 'lowHealth'
  | 'vocalNap'
  | 'throatClearing'
  | 'hydrationBoost'
  | 'whisperWarning'
  | 'measurementLowSampleRate'
  | 'measurementSimulated';

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
  baselineComplete: {
    title: 'Baseline locked in.',
    body: 'We now know your natural range. Future insights compare against it.',
    helper: 'Keep stacking short, consistent sessions to see trends emerge.',
  },
};

const coachingMessages: Record<CoachingKey, CopyBlock> = {
  lowPower: {
    title: 'Power could use support.',
    body: 'Warm up with a few breath-to-voice slides before the next session.',
    helper: 'Think “lift through the ribs” instead of pushing from the throat.',
    tags: ['easy', 'identity'],
  },
  greatClarity: {
    title: 'Clarity is shining.',
    body: 'Your articulation is sharp and easy to follow.',
    helper: 'Keep hydration nearby to maintain that precision.',
    tags: ['satisfying'],
  },
  lowHealth: {
    title: 'Health dipped below your norm.',
    body: 'Consider rest, steam, or straw phonation to reset.',
    helper: 'Ease up for a day so your instrument can rebound.',
    tags: ['simple', 'emotional'],
  },
  vocalNap: {
    title: 'Take a vocal nap.',
    body: '5–10 minutes of silence right after heavy use lets swollen tissue rebound.',
    helper: 'Set a short timer, sip water, then come back with a gentle hum.',
    tags: ['simple', 'concrete', 'emotional'],
  },
  throatClearing: {
    title: 'Skip the throat clearing grind.',
    body: 'A soft hum or swallow clears the sensation without slamming your folds together.',
    helper: 'Keep water nearby—think “hum, sip, swallow” instead of clearing.',
    tags: ['concrete', 'credible'],
  },
  hydrationBoost: {
    title: 'Treat your vocal folds like sponges.',
    body: 'When they stay wet, they stay springy and need less effort to vibrate.',
    helper: 'Pair every coffee or cocktail with an extra glass of water.',
    tags: ['concrete', 'emotional'],
  },
  whisperWarning: {
    title: 'Whispering isn’t rest.',
    body: 'It forces tight airflow that dries and irritates already sensitive tissue.',
    helper: 'Use gentle, easy speech or complete rest until the hoarseness clears.',
    tags: ['credible', 'emotional'],
  },
  measurementLowSampleRate: {
    title: 'Audio detail is too low for fine metrics.',
    body: 'Jitter and shimmer need 44.1 kHz / 16-bit audio. Find a quieter spot and re-record with the mic 15–20 cm away.',
    helper: 'Disable Bluetooth mics or dongles that downsample your audio.',
    tags: ['credible', 'simple'],
  },
  measurementSimulated: {
    title: 'Running in simulated analysis mode.',
    body: 'Install the Voice Analyzer dev build with native audio streaming to unlock precise perturbation and health metrics.',
    helper: 'Simulated metrics are for UX only; real PCM unlocks clinic-grade accuracy.',
    tags: ['credible', 'unexpected'],
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
