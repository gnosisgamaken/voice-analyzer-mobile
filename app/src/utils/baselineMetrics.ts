/**
 * Baseline Metrics System
 * 
 * Establishes user's vocal baseline from first 5 recordings
 * Calculates average for each metric to serve as comparison reference
 * 
 * Week 5 - Task 1.2
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BrandedMetrics } from './brandedMetricsEngine';

const BASELINE_STORAGE_KEY = '@voice_analyzer/baseline_metrics';
const BASELINE_RECORDINGS_KEY = '@voice_analyzer/baseline_recordings';
const BASELINE_REQUIRED_COUNT = 5;

export interface BaselineMetrics extends BrandedMetrics {
  recordingCount: number;
  establishedAt: number;
  lastUpdated: number;
}

export interface BaselineStatus {
  isEstablished: boolean;
  recordingCount: number;
  remainingCount: number;
  progress: number; // 0-100
}

/**
 * Get current baseline status
 */
export async function getBaselineStatus(): Promise<BaselineStatus> {
  try {
    const recordingsJson = await AsyncStorage.getItem(BASELINE_RECORDINGS_KEY);
    const recordings = recordingsJson ? JSON.parse(recordingsJson) : [];
    const count = recordings.length;
    
    return {
      isEstablished: count >= BASELINE_REQUIRED_COUNT,
      recordingCount: count,
      remainingCount: Math.max(0, BASELINE_REQUIRED_COUNT - count),
      progress: Math.min(100, (count / BASELINE_REQUIRED_COUNT) * 100),
    };
  } catch (error) {
    console.error('Error getting baseline status:', error);
    return {
      isEstablished: false,
      recordingCount: 0,
      remainingCount: BASELINE_REQUIRED_COUNT,
      progress: 0,
    };
  }
}

/**
 * Add a recording to baseline calculation
 */
export async function addRecordingToBaseline(
  metrics: BrandedMetrics
): Promise<BaselineStatus> {
  try {
    const recordingsJson = await AsyncStorage.getItem(BASELINE_RECORDINGS_KEY);
    const recordings: BrandedMetrics[] = recordingsJson ? JSON.parse(recordingsJson) : [];
    
    // Only store first 5 recordings for baseline
    if (recordings.length < BASELINE_REQUIRED_COUNT) {
      recordings.push(metrics);
      await AsyncStorage.setItem(BASELINE_RECORDINGS_KEY, JSON.stringify(recordings));
      
      // If we now have 5, calculate and save baseline
      if (recordings.length === BASELINE_REQUIRED_COUNT) {
        const baseline = calculateBaselineFromRecordings(recordings);
        await AsyncStorage.setItem(BASELINE_STORAGE_KEY, JSON.stringify(baseline));
      }
    }
    
    return getBaselineStatus();
  } catch (error) {
    console.error('Error adding recording to baseline:', error);
    return getBaselineStatus();
  }
}

/**
 * Get established baseline metrics
 */
export async function getBaselineMetrics(): Promise<BaselineMetrics | null> {
  try {
    const baselineJson = await AsyncStorage.getItem(BASELINE_STORAGE_KEY);
    return baselineJson ? JSON.parse(baselineJson) : null;
  } catch (error) {
    console.error('Error getting baseline metrics:', error);
    return null;
  }
}

/**
 * Calculate baseline from array of recordings
 */
function calculateBaselineFromRecordings(recordings: BrandedMetrics[]): BaselineMetrics {
  const sum = recordings.reduce(
    (acc, curr) => ({
      clarity: acc.clarity + curr.clarity,
      power: acc.power + curr.power,
      health: acc.health + curr.health,
      warmth: acc.warmth + curr.warmth,
      confidence: acc.confidence + curr.confidence,
      expressiveness: acc.expressiveness + curr.expressiveness,
      voiceIQ: acc.voiceIQ + curr.voiceIQ,
    }),
    {
      clarity: 0,
      power: 0,
      health: 0,
      warmth: 0,
      confidence: 0,
      expressiveness: 0,
      voiceIQ: 0,
    }
  );

  const count = recordings.length;
  
  return {
    clarity: Math.round(sum.clarity / count),
    power: Math.round(sum.power / count),
    health: Math.round(sum.health / count),
    warmth: Math.round(sum.warmth / count),
    confidence: Math.round(sum.confidence / count),
    expressiveness: Math.round(sum.expressiveness / count),
    voiceIQ: Math.round(sum.voiceIQ / count),
    recordingCount: count,
    establishedAt: Date.now(),
    lastUpdated: Date.now(),
  };
}

/**
 * Reset baseline (for testing or user request)
 */
export async function resetBaseline(): Promise<void> {
  try {
    await AsyncStorage.removeItem(BASELINE_STORAGE_KEY);
    await AsyncStorage.removeItem(BASELINE_RECORDINGS_KEY);
  } catch (error) {
    console.error('Error resetting baseline:', error);
  }
}

/**
 * Get comparison vs baseline for display
 */
export function compareToBaseline(
  current: BrandedMetrics,
  baseline: BaselineMetrics | null
): {
  [K in keyof BrandedMetrics]: {
    current: number;
    baseline: number | null;
    diff: number;
    percentChange: number;
  };
} | null {
  if (!baseline) return null;

  const metrics: (keyof BrandedMetrics)[] = [
    'clarity',
    'power',
    'health',
    'warmth',
    'confidence',
    'expressiveness',
    'voiceIQ',
  ];

  const comparison: any = {};

  for (const metric of metrics) {
    const currentValue = current[metric];
    const baselineValue = baseline[metric];
    const diff = currentValue - baselineValue;
    const percentChange = baselineValue > 0 
      ? Math.round((diff / baselineValue) * 100) 
      : 0;

    comparison[metric] = {
      current: currentValue,
      baseline: baselineValue,
      diff,
      percentChange,
    };
  }

  return comparison;
}
