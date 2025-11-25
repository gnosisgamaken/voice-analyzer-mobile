import type { AudioFeatures } from './enhancedAudioAnalysis';
import type { MetricKey } from '../constants/metricDefinitions';
import { METRIC_DEFINITIONS } from '../constants/metricDefinitions';
import { getMetricLabel } from '../constants/metricLabels';

export type MetricComputationStatus = 'calibrated' | 'simulated';

export interface MetricScore {
  id: MetricKey;
  value: number; // 0 - 100
  label: string;
  color: string;
  status: MetricComputationStatus;
  notes?: string[];
}

export interface BrandedMetrics {
  clarity: MetricScore;
  power: MetricScore;
  health: MetricScore;
  warmth: MetricScore;
  confidence: MetricScore;
  expressiveness: MetricScore;
  voiceIQ: MetricScore;
  readinessWarnings: string[];
}

export interface AdvancedVoiceFeatures {
  jitter?: number;
  shimmer?: number;
  hnr?: number;
  pitchRange?: number;
  pauseScore?: number;
  tempoVariability?: number;
}

const VOICE_IQ_WEIGHTS: Record<Exclude<MetricKey, 'voiceIQ'>, number> = {
  clarity: 0.2,
  power: 0.15,
  health: 0.2,
  warmth: 0.15,
  confidence: 0.15,
  expressiveness: 0.15,
};

const safeNum = (value: number, fallback: number = 0): number =>
  Number.isFinite(value) ? value : fallback;

const clamp01 = (value: number) => Math.max(0, Math.min(1, safeNum(value)));

const normalizeRange = (value: number, min: number, max: number, invert = false) => {
  const safeValue = safeNum(value, (min + max) / 2);
  if (max === min) return 0;
  const raw = (safeValue - min) / (max - min);
  const normalized = clamp01(raw);
  return invert ? 1 - normalized : normalized;
};

export class VoiceMetricsEngine {
  calculateFromAudioFeatures(
    features: AudioFeatures,
    advanced: AdvancedVoiceFeatures = {}
  ): BrandedMetrics {
    const warnings: string[] = [];

    const clarityScore = this.calculateClarity(features, advanced, warnings);
    const powerScore = this.calculatePower(features, warnings);
    const healthScore = this.calculateHealth(features, advanced, warnings);
    const warmthScore = this.calculateWarmth(features, warnings);
    const confidenceScore = this.calculateConfidence(features, advanced, warnings);
    const expressivenessScore = this.calculateExpressiveness(features, advanced, warnings);

    const voiceIQScore = this.calculateVoiceIQ(
      {
        clarity: clarityScore,
        power: powerScore,
        health: healthScore,
        warmth: warmthScore,
        confidence: confidenceScore,
        expressiveness: expressivenessScore,
      },
      warnings
    );

    return {
      clarity: clarityScore.metric,
      power: powerScore.metric,
      health: healthScore.metric,
      warmth: warmthScore.metric,
      confidence: confidenceScore.metric,
      expressiveness: expressivenessScore.metric,
      voiceIQ: voiceIQScore.metric,
      readinessWarnings: warnings,
    };
  }

  private calculateClarity(
    features: AudioFeatures,
    advanced: AdvancedVoiceFeatures,
    warnings: string[]
  ) {
    const centroidScore = normalizeRange(features.spectralCentroid, 800, 6000, false);
    const flatnessScore = clamp01(1 - features.spectralFlatness);
    const hnrScore = advanced.hnr != null
      ? normalizeRange(advanced.hnr, 5, 20)
      : flatnessScore; // proxy

    if (advanced.hnr == null) {
      warnings.push('Clarity is using spectral-flatness proxy until HNR is available.');
    }

    const normalized = clamp01(0.4 * centroidScore + 0.3 * flatnessScore + 0.3 * hnrScore);
    return this.createMetricScore('clarity', normalized, advanced.hnr != null ? 'calibrated' : 'simulated', [
      advanced.hnr == null ? 'Pending HNR feature' : undefined,
    ]);
  }

  private calculatePower(features: AudioFeatures, warnings: string[]) {
    const energyScore = normalizeRange(features.energy, 0.005, 0.05);
    const rmsScore = normalizeRange(features.rms, 0.02, 0.2);

    const normalized = clamp01(0.6 * rmsScore + 0.4 * energyScore);
    return this.createMetricScore('power', normalized, 'calibrated');
  }

  private calculateHealth(
    features: AudioFeatures,
    advanced: AdvancedVoiceFeatures,
    warnings: string[]
  ) {
    if (advanced.jitter == null || advanced.shimmer == null || advanced.hnr == null) {
      warnings.push('Vocal Health requires jitter, shimmer, and HNR – using placeholder.');
      const placeholder = clamp01(0.5 + (0.5 - features.spectralFlatness));
      return this.createMetricScore('health', placeholder, 'simulated', [
        'Pending jitter/shimmer/HNR inputs',
      ]);
    }

    const jitterScore = clamp01(1 - advanced.jitter * 1000);
    const shimmerScore = clamp01(1 - advanced.shimmer * 100);
    const hnrScore = normalizeRange(advanced.hnr, 5, 20);

    const normalized = clamp01(0.4 * jitterScore + 0.4 * shimmerScore + 0.2 * hnrScore);
    return this.createMetricScore('health', normalized, 'calibrated');
  }

  private calculateWarmth(features: AudioFeatures, warnings: string[]) {
    const centroidScore = normalizeRange(features.spectralCentroid, 500, 5000, true);
    const fluxSoftness = clamp01(1 - normalizeRange(features.spectralFlux, 0, 1200));
    const normalized = clamp01(0.7 * centroidScore + 0.3 * fluxSoftness);
    return this.createMetricScore('warmth', normalized, 'calibrated');
  }

  private calculateConfidence(
    features: AudioFeatures,
    advanced: AdvancedVoiceFeatures,
    warnings: string[]
  ) {
    const pitchStability = clamp01(1 - normalizeRange(features.spectralFlux, 0, 2000));
    const pauseScore = advanced.pauseScore != null ? clamp01(advanced.pauseScore) : 0.6;

    if (advanced.pauseScore == null) {
      warnings.push('Confidence metric missing pause cadence – using neutral default.');
    }

    const normalized = clamp01(0.6 * pitchStability + 0.4 * pauseScore);
    const status: MetricComputationStatus = advanced.pauseScore != null ? 'calibrated' : 'simulated';

    return this.createMetricScore('confidence', normalized, status, [
      advanced.pauseScore == null ? 'Pending speech fluency analysis' : undefined,
    ]);
  }

  private calculateExpressiveness(
    features: AudioFeatures,
    advanced: AdvancedVoiceFeatures,
    warnings: string[]
  ) {
    const fluxScore = normalizeRange(features.spectralFlux, 100, 2000);
    const tempoScore = advanced.tempoVariability != null ? clamp01(advanced.tempoVariability) : 0.5;
    const pitchRangeScore = advanced.pitchRange != null ? normalizeRange(advanced.pitchRange, 50, 400) : 0.5;

    if (advanced.tempoVariability == null || advanced.pitchRange == null) {
      warnings.push('Expressiveness metric missing pitch/tempo tracking – using placeholders.');
    }

    const normalized = clamp01(0.4 * fluxScore + 0.3 * tempoScore + 0.3 * pitchRangeScore);
    const status: MetricComputationStatus =
      advanced.tempoVariability != null && advanced.pitchRange != null ? 'calibrated' : 'simulated';

    return this.createMetricScore('expressiveness', normalized, status, [
      advanced.tempoVariability == null ? 'Pending tempo analysis' : undefined,
      advanced.pitchRange == null ? 'Pending pitch range tracking' : undefined,
    ]);
  }

  private calculateVoiceIQ(
    metrics: Record<Exclude<MetricKey, 'voiceIQ'>, { normalized: number; metric: MetricScore }>,
    warnings: string[]
  ) {
    let composite = 0;
    let simulatedCount = 0;

    (Object.keys(VOICE_IQ_WEIGHTS) as Array<Exclude<MetricKey, 'voiceIQ'>>).forEach((metric) => {
      const weight = VOICE_IQ_WEIGHTS[metric];
      composite += metrics[metric].normalized * weight;
      if (metrics[metric].metric.status === 'simulated') {
        simulatedCount += 1;
      }
    });

    const normalizedValues = (Object.keys(VOICE_IQ_WEIGHTS) as Array<Exclude<MetricKey, 'voiceIQ'>>)
      .map((key) => metrics[key].normalized);

    if (normalizedValues.every((score) => score >= 0.6)) {
      composite += 0.05; // +5 points after scaling
    }

    if (normalizedValues.some((score) => score <= 0.3)) {
      composite -= 0.1;
    }

    const normalizedScore = clamp01(composite);
    const metric = this.createMetricScore(
      'voiceIQ',
      normalizedScore,
      simulatedCount === 0 ? 'calibrated' : 'simulated',
      [simulatedCount > 0 ? 'Depends on simulated component metrics' : undefined]
    );

    return { normalized: normalizedScore, metric: metric.metric };
  }

  private createMetricScore(
    id: MetricKey,
    normalized: number,
    status: MetricComputationStatus,
    notes: Array<string | undefined> = []
  ) {
    const value = Math.round(clamp01(normalized) * 100);
    const label = getMetricLabel(id, value);
    const cleanedNotes = notes.filter((entry): entry is string => Boolean(entry));

    return {
      normalized: clamp01(normalized),
      metric: {
        id,
        value,
        label: label.label,
        color: label.color,
        status,
        notes: cleanedNotes.length ? cleanedNotes : undefined,
      },
    };
  }
}
