import type { VoiceSample, VoiceMetrics } from '../types';
import type { BrandedMetrics } from './VoiceMetricsEngine';
import type { MetricKey } from '../constants/metricDefinitions';
import { getMetricLabel } from '../constants/metricLabels';

export const BRANDED_METRIC_KEYS: MetricKey[] = [
  'clarity',
  'power',
  'health',
  'warmth',
  'confidence',
  'expressiveness',
  'voiceIQ',
];

export function computeAverageVoiceMetrics(samples: VoiceSample[]): VoiceMetrics {
  if (!samples.length) {
    return {
      brightness: 0.5,
      clarity: 0.5,
      richness: 0.5,
      energy: 0.5,
      pitchStability: 0.5,
    };
  }

  const sums = samples.reduce(
    (acc, sample) => ({
      brightness: acc.brightness + (sample.voiceMetrics?.brightness ?? 0),
      clarity: acc.clarity + (sample.voiceMetrics?.clarity ?? 0),
      richness: acc.richness + (sample.voiceMetrics?.richness ?? 0),
      energy: acc.energy + (sample.voiceMetrics?.energy ?? 0),
      pitchStability: acc.pitchStability + (sample.voiceMetrics?.pitchStability ?? 0),
    }),
    { brightness: 0, clarity: 0, richness: 0, energy: 0, pitchStability: 0 },
  );

  return {
    brightness: sums.brightness / samples.length,
    clarity: sums.clarity / samples.length,
    richness: sums.richness / samples.length,
    energy: sums.energy / samples.length,
    pitchStability: sums.pitchStability / samples.length,
  };
}

export function computeAverageBrandedMetrics(samples: VoiceSample[]): BrandedMetrics | null {
  const brandedSamples = samples.filter((sample) => !!sample.brandedMetrics);

  if (!brandedSamples.length) {
    return null;
  }

  const aggregates = BRANDED_METRIC_KEYS.reduce<
    Record<MetricKey, { sum: number; count: number; simulated: boolean }>
  >((acc, key) => {
    acc[key] = { sum: 0, count: 0, simulated: false };
    return acc;
  }, {} as Record<MetricKey, { sum: number; count: number; simulated: boolean }>);

  brandedSamples.forEach((sample) => {
    const metric = sample.brandedMetrics!;
    BRANDED_METRIC_KEYS.forEach((key) => {
      const current = metric[key];
      if (!current) {
        return;
      }
      aggregates[key].sum += current.value;
      aggregates[key].count += 1;
      if (current.status === 'simulated') {
        aggregates[key].simulated = true;
      }
    });
  });

  const averaged: Partial<BrandedMetrics> = {};
  BRANDED_METRIC_KEYS.forEach((key) => {
    const data = aggregates[key];
    if (!data.count) {
      return;
    }
    const value = data.sum / data.count;
    const label = getMetricLabel(key, value);
    averaged[key] = {
      id: key,
      value: Math.round(value),
      label: label.label,
      color: label.color,
      status: data.simulated ? 'simulated' : 'calibrated',
    };
  });

  return averaged as BrandedMetrics;
}
