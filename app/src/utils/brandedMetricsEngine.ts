/**
 * Branded Metrics Engine
 * 
 * Calculates the 6 core branded metrics and Voice IQ™ composite score.
 * Based on the Voice Analyzer UX & Copywriting strategy.
 * 
 * Core Metrics:
 * - 💎 Voice Clarity (spectral centroid, flatness, HNR)
 * - ⚡ Vocal Power (RMS energy, dynamic range)
 * - ❤️ Vocal Health (jitter, shimmer, HNR)
 * - ☀️ Warmth (formants, spectral slope, MFCC richness)
 * - 👑 Confidence (pitch stability, resonance)
 * - 🔥 Expressiveness (pitch range, intensity variance)
 * 
 * All scores normalized to 0-100 scale.
 */

import { VoiceMetrics } from '../types';

export interface BrandedMetrics {
  clarity: number;        // 0-100
  power: number;          // 0-100
  health: number;         // 0-100
  warmth: number;         // 0-100
  confidence: number;     // 0-100
  expressiveness: number; // 0-100
  voiceIQ: number;        // 0-100 composite
}

export interface BrandedMetricDetails {
  score: number;
  label: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * Normalize a value to 0-100 scale
 */
function normalize(value: number, min: number = 0, max: number = 100): number {
  const clamped = Math.max(min, Math.min(max, value));
  return Math.round(((clamped - min) / (max - min)) * 100);
}

/**
 * Safe division to avoid NaN
 */
function safeDivide(numerator: number, denominator: number, fallback: number = 0): number {
  if (denominator === 0 || !isFinite(denominator)) return fallback;
  const result = numerator / denominator;
  return isFinite(result) ? result : fallback;
}

/**
 * 💎 Voice Clarity
 * How easy it is for other people to understand you.
 * 
 * Calculation:
 * - 40% Spectral Centroid (brightness/articulation)
 * - 30% Spectral Flatness (noise vs tonal)
 * - 30% HNR (harmonic clarity)
 */
export function calculateClarity(metrics: VoiceMetrics): number {
  const { brightness = 0, clarity = 0 } = metrics;
  
  // Spectral centroid (brightness) normalized to 0-100
  // Typical range: 1000-4000 Hz, optimal around 2000-3000 Hz
  const spectralCentroidScore = normalize(brightness, 1000, 4000);
  
  // Clarity metric (already normalized in existing implementation)
  const clarityScore = Math.max(0, Math.min(100, clarity));
  
  // HNR approximation from existing metrics
  // Higher clarity typically correlates with better HNR
  const hnrScore = clarityScore;
  
  // Weighted combination
  const finalScore = (
    spectralCentroidScore * 0.4 +
    clarityScore * 0.3 +
    hnrScore * 0.3
  );
  
  return Math.round(finalScore);
}

/**
 * ⚡ Vocal Power
 * The strength and projection of your voice.
 * 
 * Calculation:
 * - RMS energy (dB)
 * - Dynamic range factor
 */
export function calculatePower(metrics: VoiceMetrics): number {
  const { energy = 0 } = metrics;
  
  // Energy is typically in normalized range, scale to dB-like
  // Assume energy 0-1 maps to -80 to 0 dB
  const estimatedDB = (energy * 80) - 80;
  
  // Normalize to 0-100 scale
  // -80 dB (silence) = 0, -20 dB (loud) = 100
  const powerScore = normalize(estimatedDB + 80, 0, 60);
  
  return Math.round(powerScore);
}

/**
 * ❤️ Vocal Health
 * The stability and well-being of your vocal mechanism.
 * 
 * Calculation:
 * - 40% Jitter (pitch perturbation)
 * - 40% Shimmer (amplitude perturbation)
 * - 20% HNR (harmonics-to-noise ratio)
 * 
 * Note: Full implementation requires pitch period analysis.
 * This version uses existing metrics as approximations.
 */
export function calculateHealth(metrics: VoiceMetrics): number {
  const { pitchStability = 0, clarity = 0 } = metrics;
  
  // Pitch stability inversely correlates with jitter
  // Higher stability = lower jitter = better health
  const jitterScore = pitchStability;
  
  // Approximate shimmer from clarity and pitch stability
  const shimmerScore = (pitchStability + clarity) / 2;
  
  // HNR approximation from clarity
  const hnrScore = clarity;
  
  // Weighted combination
  const healthScore = (
    jitterScore * 0.4 +
    shimmerScore * 0.4 +
    hnrScore * 0.2
  );
  
  return Math.round(healthScore);
}

/**
 * ☀️ Warmth
 * The richness and pleasantness of your vocal tone.
 * 
 * Calculation:
 * - 50% Formant characteristics (F1/F2 lowness)
 * - 30% Spectral slope (gentleness)
 * - 20% MFCC richness
 */
export function calculateWarmth(metrics: VoiceMetrics): number {
  const { richness = 0, brightness = 0 } = metrics;
  
  // Richness directly maps to warmth
  const richnessScore = Math.max(0, Math.min(100, richness));
  
  // Lower spectral centroid (darker tone) = warmer
  // Invert brightness for warmth
  const formantScore = 100 - normalize(brightness, 1000, 4000);
  
  // Spectral slope approximation from brightness
  const spectralSlopeScore = formantScore;
  
  // Weighted combination
  const warmthScore = (
    formantScore * 0.5 +
    spectralSlopeScore * 0.3 +
    richnessScore * 0.2
  );
  
  return Math.round(warmthScore);
}

/**
 * 👑 Confidence
 * The steadiness and resonance of your voice.
 * 
 * Calculation:
 * - 50% Pitch stability
 * - 30% Resonance strength
 * - 20% Speech fluency
 */
export function calculateConfidence(metrics: VoiceMetrics): number {
  const { pitchStability = 0, clarity = 0, energy = 0 } = metrics;
  
  // Pitch stability is primary indicator
  const stabilityScore = pitchStability;
  
  // Resonance approximated from clarity and energy
  const resonanceScore = (clarity + (energy * 100)) / 2;
  
  // Fluency approximated from pitch stability
  const fluencyScore = pitchStability;
  
  // Weighted combination
  const confidenceScore = (
    stabilityScore * 0.5 +
    resonanceScore * 0.3 +
    fluencyScore * 0.2
  );
  
  return Math.round(confidenceScore);
}

/**
 * 🔥 Expressiveness
 * The variation and dynamism in your voice.
 * 
 * Calculation:
 * - 40% Pitch range
 * - 30% Intensity variance
 * - 30% Tempo variability
 */
export function calculateExpressiveness(metrics: VoiceMetrics): number {
  const { pitchRange = 0, energy = 0 } = metrics;
  
  // Pitch range (in semitones, typical speaking: 3-12 semitones)
  const pitchRangeScore = normalize(pitchRange, 0, 12) * 0.4;
  
  // Energy variance approximation
  // Higher energy suggests more dynamic expression
  const intensityScore = (energy * 100) * 0.3;
  
  // Tempo variability (approximate from pitch range)
  const tempoScore = normalize(pitchRange, 0, 12) * 0.3;
  
  // Weighted combination
  const expressivenessScore = pitchRangeScore + intensityScore + tempoScore;
  
  return Math.round(expressivenessScore);
}

/**
 * Voice IQ™
 * Composite score representing overall vocal quality.
 * 
 * Calculation:
 * - 20% Clarity (critical for communication)
 * - 15% Power (projection matters)
 * - 20% Health (foundation of good voice)
 * - 15% Warmth (pleasant tone)
 * - 15% Confidence (steadiness)
 * - 15% Expressiveness (dynamic range)
 * + Consistency bonus (all metrics in healthy range)
 */
export function calculateVoiceIQ(brandedMetrics: BrandedMetrics): number {
  const {
    clarity,
    power,
    health,
    warmth,
    confidence,
    expressiveness,
  } = brandedMetrics;
  
  // Weighted composite
  const baseScore = (
    clarity * 0.20 +
    power * 0.15 +
    health * 0.20 +
    warmth * 0.15 +
    confidence * 0.15 +
    expressiveness * 0.15
  );
  
  // Consistency bonus: all metrics above 60 = +5 points
  const allMetrics = [clarity, power, health, warmth, confidence, expressiveness];
  const allHealthy = allMetrics.every(m => m >= 60);
  const consistencyBonus = allHealthy ? 5 : 0;
  
  const finalScore = Math.min(100, baseScore + consistencyBonus);
  
  return Math.round(finalScore);
}

/**
 * Calculate all branded metrics from voice metrics
 */
export function calculateBrandedMetrics(voiceMetrics: VoiceMetrics): BrandedMetrics {
  const clarity = calculateClarity(voiceMetrics);
  const power = calculatePower(voiceMetrics);
  const health = calculateHealth(voiceMetrics);
  const warmth = calculateWarmth(voiceMetrics);
  const confidence = calculateConfidence(voiceMetrics);
  const expressiveness = calculateExpressiveness(voiceMetrics);
  
  const brandedMetrics = {
    clarity,
    power,
    health,
    warmth,
    confidence,
    expressiveness,
    voiceIQ: 0, // Calculate after having all metrics
  };
  
  brandedMetrics.voiceIQ = calculateVoiceIQ(brandedMetrics);
  
  return brandedMetrics;
}

/**
 * Get qualitative label for a metric score
 */
export function getMetricLabel(metricName: string, score: number): string {
  const labels: { [key: string]: { [key: string]: string } } = {
    clarity: {
      '0-30': 'Muffled',
      '31-50': 'Unclear',
      '51-70': 'Clear',
      '71-85': 'Very Clear',
      '86-100': 'Crystal Clear',
    },
    power: {
      '0-30': 'Weak',
      '31-50': 'Soft',
      '51-70': 'Strong',
      '71-85': 'Powerful',
      '86-100': 'Commanding',
    },
    health: {
      '0-30': 'Strained',
      '31-50': 'Tired',
      '51-70': 'Healthy',
      '71-85': 'Very Healthy',
      '86-100': 'Excellent',
    },
    warmth: {
      '0-30': 'Harsh',
      '31-50': 'Cool',
      '51-70': 'Warm',
      '71-85': 'Rich',
      '86-100': 'Velvety',
    },
    confidence: {
      '0-30': 'Shaky',
      '31-50': 'Uncertain',
      '51-70': 'Steady',
      '71-85': 'Confident',
      '86-100': 'Commanding',
    },
    expressiveness: {
      '0-30': 'Flat',
      '31-50': 'Limited',
      '51-70': 'Expressive',
      '71-85': 'Very Expressive',
      '86-100': 'Dynamic',
    },
    voiceIQ: {
      '0-30': 'Developing',
      '31-50': 'Fair',
      '51-70': 'Good',
      '71-85': 'Excellent',
      '86-100': 'Outstanding',
    },
  };
  
  const metricLabels = labels[metricName.toLowerCase()] || labels.voiceIQ;
  
  if (score >= 86) return metricLabels['86-100'];
  if (score >= 71) return metricLabels['71-85'];
  if (score >= 51) return metricLabels['51-70'];
  if (score >= 31) return metricLabels['31-50'];
  return metricLabels['0-30'];
}

/**
 * Get full details for a branded metric
 */
export function getBrandedMetricDetails(
  metricName: string,
  score: number
): BrandedMetricDetails {
  const metricInfo: { [key: string]: { icon: string; color: string; description: string } } = {
    clarity: {
      icon: '💎',
      color: '#3B82F6', // Blue
      description: 'How easy it is for other people to understand you.',
    },
    power: {
      icon: '⚡',
      color: '#F59E0B', // Amber
      description: 'The strength and projection of your voice.',
    },
    health: {
      icon: '❤️',
      color: '#EF4444', // Red
      description: 'The stability and well-being of your vocal mechanism.',
    },
    warmth: {
      icon: '☀️',
      color: '#F97316', // Orange
      description: 'The richness and pleasantness of your vocal tone.',
    },
    confidence: {
      icon: '👑',
      color: '#8B5CF6', // Purple
      description: 'The steadiness and resonance of your voice.',
    },
    expressiveness: {
      icon: '🔥',
      color: '#EC4899', // Pink
      description: 'The variation and dynamism in your voice.',
    },
    voiceIQ: {
      icon: '✨',
      color: '#10B981', // Green
      description: 'Your overall vocal quality composite score.',
    },
  };
  
  const info = metricInfo[metricName.toLowerCase()] || metricInfo.voiceIQ;
  const label = getMetricLabel(metricName, score);
  
  return {
    score,
    label,
    description: info.description,
    icon: info.icon,
    color: info.color,
  };
}

/**
 * Get trend indicator based on comparison with baseline
 */
export function getTrendIndicator(
  currentScore: number,
  baselineScore: number
): { direction: 'up' | 'down' | 'stable'; change: number; label: string } {
  const change = currentScore - baselineScore;
  const absChange = Math.abs(change);
  
  // Consider < 3 point changes as stable
  if (absChange < 3) {
    return {
      direction: 'stable',
      change: 0,
      label: '→ Stable',
    };
  }
  
  if (change > 0) {
    return {
      direction: 'up',
      change: Math.round(change),
      label: `↑ +${Math.round(change)}`,
    };
  }
  
  return {
    direction: 'down',
    change: Math.round(change),
    label: `↓ ${Math.round(change)}`,
  };
}
