/**
 * Trend Tracking System
 * 
 * Tracks voice metrics over time (7-day and 30-day windows)
 * Detects improvements and declines
 * Generates trend indicators for UI
 * 
 * Week 5 - Task 1.2
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BrandedMetrics } from './brandedMetricsEngine';

const TREND_HISTORY_KEY = '@voice_analyzer/trend_history';
const MAX_HISTORY_DAYS = 90; // Keep 90 days of history

export interface TrendDataPoint {
  timestamp: number;
  metrics: BrandedMetrics;
}

export interface TrendWindow {
  average: BrandedMetrics;
  dataPoints: TrendDataPoint[];
  startDate: number;
  endDate: number;
}

export interface TrendAnalysis {
  sevenDay: TrendWindow | null;
  thirtyDay: TrendWindow | null;
  allTime: TrendWindow | null;
}

export type TrendDirection = 'up' | 'down' | 'stable';

export interface MetricTrend {
  direction: TrendDirection;
  change: number;
  percentChange: number;
}

/**
 * Add metrics to trend history
 */
export async function addToTrendHistory(metrics: BrandedMetrics): Promise<void> {
  try {
    const historyJson = await AsyncStorage.getItem(TREND_HISTORY_KEY);
    const history: TrendDataPoint[] = historyJson ? JSON.parse(historyJson) : [];
    
    // Add new data point
    history.push({
      timestamp: Date.now(),
      metrics,
    });
    
    // Keep only last 90 days
    const cutoff = Date.now() - (MAX_HISTORY_DAYS * 24 * 60 * 60 * 1000);
    const filtered = history.filter(point => point.timestamp > cutoff);
    
    await AsyncStorage.setItem(TREND_HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error adding to trend history:', error);
  }
}

/**
 * Get trend history for specified time window
 */
export async function getTrendHistory(days: number = 90): Promise<TrendDataPoint[]> {
  try {
    const historyJson = await AsyncStorage.getItem(TREND_HISTORY_KEY);
    const history: TrendDataPoint[] = historyJson ? JSON.parse(historyJson) : [];
    
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return history.filter(point => point.timestamp > cutoff);
  } catch (error) {
    console.error('Error getting trend history:', error);
    return [];
  }
}

/**
 * Calculate average metrics for time window
 */
function calculateWindowAverage(dataPoints: TrendDataPoint[]): BrandedMetrics {
  if (dataPoints.length === 0) {
    return {
      clarity: 0,
      power: 0,
      health: 0,
      warmth: 0,
      confidence: 0,
      expressiveness: 0,
      voiceIQ: 0,
    };
  }

  const sum = dataPoints.reduce(
    (acc, point) => ({
      clarity: acc.clarity + point.metrics.clarity,
      power: acc.power + point.metrics.power,
      health: acc.health + point.metrics.health,
      warmth: acc.warmth + point.metrics.warmth,
      confidence: acc.confidence + point.metrics.confidence,
      expressiveness: acc.expressiveness + point.metrics.expressiveness,
      voiceIQ: acc.voiceIQ + point.metrics.voiceIQ,
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

  const count = dataPoints.length;

  return {
    clarity: Math.round(sum.clarity / count),
    power: Math.round(sum.power / count),
    health: Math.round(sum.health / count),
    warmth: Math.round(sum.warmth / count),
    confidence: Math.round(sum.confidence / count),
    expressiveness: Math.round(sum.expressiveness / count),
    voiceIQ: Math.round(sum.voiceIQ / count),
  };
}

/**
 * Get comprehensive trend analysis
 */
export async function getTrendAnalysis(): Promise<TrendAnalysis> {
  const allData = await getTrendHistory(MAX_HISTORY_DAYS);
  
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

  const sevenDayData = allData.filter(p => p.timestamp > sevenDaysAgo);
  const thirtyDayData = allData.filter(p => p.timestamp > thirtyDaysAgo);

  return {
    sevenDay: sevenDayData.length > 0
      ? {
          average: calculateWindowAverage(sevenDayData),
          dataPoints: sevenDayData,
          startDate: sevenDaysAgo,
          endDate: now,
        }
      : null,
    thirtyDay: thirtyDayData.length > 0
      ? {
          average: calculateWindowAverage(thirtyDayData),
          dataPoints: thirtyDayData,
          startDate: thirtyDaysAgo,
          endDate: now,
        }
      : null,
    allTime: allData.length > 0
      ? {
          average: calculateWindowAverage(allData),
          dataPoints: allData,
          startDate: allData[0]?.timestamp || now,
          endDate: now,
        }
      : null,
  };
}

/**
 * Calculate trend for a specific metric
 */
export function calculateMetricTrend(
  current: number,
  previous: number,
  threshold: number = 3
): MetricTrend {
  const change = current - previous;
  const absChange = Math.abs(change);
  const percentChange = previous > 0 ? Math.round((change / previous) * 100) : 0;

  // Changes less than threshold are considered stable
  if (absChange < threshold) {
    return {
      direction: 'stable',
      change: 0,
      percentChange: 0,
    };
  }

  return {
    direction: change > 0 ? 'up' : 'down',
    change: Math.round(change),
    percentChange,
  };
}

/**
 * Get sparkline data for a metric (last 7 days)
 */
export async function getSparklineData(
  metricName: keyof BrandedMetrics,
  days: number = 7
): Promise<number[]> {
  const history = await getTrendHistory(days);
  
  if (history.length === 0) {
    return [];
  }

  // Return metric values over time
  return history.map(point => point.metrics[metricName]);
}

/**
 * Detect if metric is improving, declining, or stable
 */
export interface ImprovementAnalysis {
  isImproving: boolean;
  isDeclining: boolean;
  isStable: boolean;
  changeRate: number; // points per week
}

export async function analyzeImprovement(
  metricName: keyof BrandedMetrics
): Promise<ImprovementAnalysis> {
  const history = await getTrendHistory(14); // Look at last 2 weeks

  if (history.length < 3) {
    return {
      isImproving: false,
      isDeclining: false,
      isStable: true,
      changeRate: 0,
    };
  }

  // Calculate linear regression to detect trend
  const values = history.map(p => p.metrics[metricName]);
  const times = history.map(p => p.timestamp);

  // Simple slope calculation
  const n = values.length;
  const sumX = times.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = times.reduce((sum, x, i) => sum + x * values[i], 0);
  const sumX2 = times.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Convert slope to points per week
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const changeRate = slope * msPerWeek;

  return {
    isImproving: changeRate > 1,
    isDeclining: changeRate < -1,
    isStable: Math.abs(changeRate) <= 1,
    changeRate: Math.round(changeRate * 10) / 10,
  };
}

/**
 * Clear all trend history (for testing or user request)
 */
export async function clearTrendHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TREND_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing trend history:', error);
  }
}
