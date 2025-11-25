import type { VoiceMetrics } from '../types';
import { VoiceAnalyzer, calculateVoiceMetrics } from './enhancedAudioAnalysis';

export type BrandedMetricName =
  | 'clarity'
  | 'power'
  | 'health'
  | 'warmth'
  | 'confidence'
  | 'expressiveness'
  | 'voiceIQ';

export interface BrandedMetrics {
  clarity: number;
  power: number;
  health: number;
  warmth: number;
  confidence: number;
  expressiveness: number;
  voiceIQ: number;
}

export interface BrandedMetricDetails {
  icon: string;
  color: string;
  label: string;
  description: string;
  score: number;
}

const clampScore = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
};

const safeMetric = (value: number | undefined, fallback = 0.5): number => {
  if (value == null || Number.isNaN(value)) {
    return fallback;
  }
  return value;
};

const normalizePitchRange = (range?: number | null): number => {
  if (!range || !Number.isFinite(range)) {
    return 0.2;
  }
  const maxRange = 400; // Hz spread we consider "very expressive"
  return Math.max(0, Math.min(1, range / maxRange));
};

const METRIC_METADATA: Record<BrandedMetricName, {
  icon: string;
  color: string;
  description: string;
  ranges: Array<{ max: number; label: string }>;
}> = {
  clarity: {
    icon: '💎',
    color: '#5A80FF',
    description: 'How easily your audience can distinguish consonants and formants.',
    ranges: [
      { max: 30, label: 'Muffled' },
      { max: 55, label: 'Developing' },
      { max: 75, label: 'Clear' },
      { max: 90, label: 'Very Clear' },
      { max: 101, label: 'Crystal Clear' },
    ],
  },
  power: {
    icon: '⚡',
    color: '#FF9F0A',
    description: 'Projection and energy in your airflow without shouting.',
    ranges: [
      { max: 25, label: 'Quiet' },
      { max: 55, label: 'Balanced' },
      { max: 80, label: 'Commanding' },
      { max: 101, label: 'Resonant' },
    ],
  },
  health: {
    icon: '❤️',
    color: '#1DD759',
    description: 'Indicators tied to jitter, shimmer, and harmonic richness.',
    ranges: [
      { max: 40, label: 'Fatigued' },
      { max: 65, label: 'Steady' },
      { max: 85, label: 'Thriving' },
      { max: 101, label: 'Peak' },
    ],
  },
  warmth: {
    icon: '☀️',
    color: '#FFB703',
    description: 'Low-mid resonance that feels inviting and grounded.',
    ranges: [
      { max: 35, label: 'Cool' },
      { max: 60, label: 'Neutral' },
      { max: 85, label: 'Inviting' },
      { max: 101, label: 'Radiant' },
    ],
  },
  confidence: {
    icon: '👑',
    color: '#AF52DE',
    description: 'Pitch and volume steadiness that signals authority.',
    ranges: [
      { max: 35, label: 'Hesitant' },
      { max: 60, label: 'Steady' },
      { max: 85, label: 'Assured' },
      { max: 101, label: 'Commanding' },
    ],
  },
  expressiveness: {
    icon: '🔥',
    color: '#FF375F',
    description: 'Pitch span and airflow variety that keeps listeners engaged.',
    ranges: [
      { max: 30, label: 'Flat' },
      { max: 60, label: 'Reserved' },
      { max: 85, label: 'Dynamic' },
      { max: 101, label: 'Electric' },
    ],
  },
  voiceIQ: {
    icon: '✨',
    color: '#0A84FF',
    description: 'Composite of the six core metrics weighted for clinical trust.',
    ranges: [
      { max: 40, label: 'Needs Support' },
      { max: 70, label: 'On Track' },
      { max: 85, label: 'Performing' },
      { max: 101, label: 'Elite' },
    ],
  },
};

const getLabelForScore = (name: BrandedMetricName, score: number): string => {
  const info = METRIC_METADATA[name];
  const range = info.ranges.find((r) => score <= r.max);
  return range ? range.label : info.ranges[info.ranges.length - 1].label;
};

export function getBrandedMetricDetails(metricName: BrandedMetricName, score: number): BrandedMetricDetails {
  const value = clampScore(score);
  const meta = METRIC_METADATA[metricName];
  return {
    icon: meta.icon,
    color: meta.color,
    description: meta.description,
    label: getLabelForScore(metricName, value),
    score: value,
  };
}

export function getTrendIndicator(current: number, previous: number, threshold: number = 1.5) {
  const delta = current - previous;
  if (Math.abs(delta) <= threshold) {
    return { direction: 'stable' as const, change: 0, label: 'Stable' };
  }
  const rounded = Math.round(delta);
  return {
    direction: rounded > 0 ? ('up' as const) : ('down' as const),
    change: rounded,
    label: `${rounded > 0 ? '+' : ''}${rounded} vs prior`,
  };
}

export function calculateBrandedMetrics(metrics: VoiceMetrics): BrandedMetrics {
  const brightness = safeMetric(metrics.brightness);
  const clarityRaw = safeMetric(metrics.clarity, brightness);
  const richness = safeMetric(metrics.richness);
  const energy = safeMetric(metrics.energy);
  const pitchStability = safeMetric(metrics.pitchStability);
  const pitchRangeNorm = normalizePitchRange(metrics.pitchRange);

  const clarity = clampScore(clarityRaw * 100);
  const power = clampScore(Math.pow(energy, 0.6) * 115);
  const health = clampScore(((pitchStability * 0.7) + (richness * 0.3)) * 100);
  const warmth = clampScore(((1 - brightness) * 0.6 + richness * 0.4) * 100);
  const confidence = clampScore(((pitchStability * 0.65) + (energy * 0.35)) * 100);
  const expressiveness = clampScore(((pitchRangeNorm * 0.7) + (energy * 0.2) + ((1 - pitchStability) * 0.1)) * 100);

  const voiceIQ = clampScore(
    clarity * 0.2 +
    power * 0.15 +
    health * 0.2 +
    warmth * 0.15 +
    confidence * 0.15 +
    expressiveness * 0.15
  );

  return {
    clarity,
    power,
    health,
    warmth,
    confidence,
    expressiveness,
    voiceIQ,
  };
}

export function calculateBrandedMetricsFromPCM(pcm: Float32Array, sampleRate = 44100): BrandedMetrics {
  const analyzer = new VoiceAnalyzer(sampleRate);
  const features = analyzer.extractFeatures(pcm);
  const voiceMetrics = calculateVoiceMetrics(features);
  return calculateBrandedMetrics(voiceMetrics);
}

// Backwards compatibility for older imports/tests referencing calculateMetrics
export const calculateMetrics = calculateBrandedMetrics;
