import type { MetricKey } from './metricDefinitions';

type MetricLabel = {
  min: number;
  max: number;
  label: string;
  color: string;
};

const DEFAULT_LABELS: MetricLabel[] = [
  { min: 0, max: 30, label: 'Needs Work', color: '#FF3B30' },
  { min: 30, max: 50, label: 'Developing', color: '#FF9500' },
  { min: 50, max: 70, label: 'On Track', color: '#34C759' },
  { min: 70, max: 85, label: 'Strong', color: '#007AFF' },
  { min: 85, max: 101, label: 'Elite', color: '#5856D6' },
];

export const METRIC_LABELS: Record<MetricKey, MetricLabel[]> = {
  clarity: [
    { min: 0, max: 30, label: 'Muffled', color: '#FF3B30' },
    { min: 30, max: 50, label: 'Unclear', color: '#FF9500' },
    { min: 50, max: 70, label: 'Clear', color: '#34C759' },
    { min: 70, max: 85, label: 'Very Clear', color: '#007AFF' },
    { min: 85, max: 101, label: 'Crystal Clear', color: '#5856D6' },
  ],
  power: [
    { min: 0, max: 30, label: 'Soft', color: '#8E8E93' },
    { min: 30, max: 50, label: 'Balanced', color: '#34C759' },
    { min: 50, max: 70, label: 'Commanding', color: '#FF9500' },
    { min: 70, max: 85, label: 'Rallying', color: '#FF3B30' },
    { min: 85, max: 101, label: 'Unstoppable', color: '#AF52DE' },
  ],
  health: [
    { min: 0, max: 30, label: 'Strained', color: '#FF3B30' },
    { min: 30, max: 50, label: 'Fatigued', color: '#FF9500' },
    { min: 50, max: 70, label: 'Steady', color: '#34C759' },
    { min: 70, max: 85, label: 'Thriving', color: '#007AFF' },
    { min: 85, max: 101, label: 'Peak', color: '#00C7BE' },
  ],
  warmth: [
    { min: 0, max: 30, label: 'Cool', color: '#5AC8FA' },
    { min: 30, max: 50, label: 'Neutral', color: '#8E8E93' },
    { min: 50, max: 70, label: 'Inviting', color: '#FFCC00' },
    { min: 70, max: 85, label: 'Charming', color: '#FF9500' },
    { min: 85, max: 101, label: 'Radiant', color: '#FF3B30' },
  ],
  confidence: [
    { min: 0, max: 30, label: 'Hesitant', color: '#FF3B30' },
    { min: 30, max: 50, label: 'Steady', color: '#FF9500' },
    { min: 50, max: 70, label: 'Assured', color: '#34C759' },
    { min: 70, max: 85, label: 'Compelling', color: '#007AFF' },
    { min: 85, max: 101, label: 'Authoritative', color: '#AF52DE' },
  ],
  expressiveness: [
    { min: 0, max: 30, label: 'Flat', color: '#8E8E93' },
    { min: 30, max: 50, label: 'Reserved', color: '#FF9500' },
    { min: 50, max: 70, label: 'Engaging', color: '#34C759' },
    { min: 70, max: 85, label: 'Dynamic', color: '#FF2D55' },
    { min: 85, max: 101, label: 'Electrifying', color: '#AF52DE' },
  ],
  voiceIQ: DEFAULT_LABELS,
};

export function getMetricLabel(metric: MetricKey, score: number): MetricLabel {
  const labels = METRIC_LABELS[metric] ?? DEFAULT_LABELS;
  const clamped = Math.max(0, Math.min(100, score));
  return labels.find((range) => clamped >= range.min && clamped < range.max) ?? labels[0];
}
