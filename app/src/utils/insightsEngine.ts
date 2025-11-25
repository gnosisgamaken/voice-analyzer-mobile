import type { BrandedMetrics } from './brandedMetricsEngine';
import type { BaselineMetrics } from './baselineMetrics';
import type { TrendAnalysis, TrendDataPoint } from './trendTracking';

export type InsightCategory = 'whatsImproving' | 'whatToWatch' | 'streak' | 'milestone' | 'trend';
export type InsightTone = 'info' | 'warning' | 'celebration';

export interface Insight {
  id: string;
  category: InsightCategory;
  title: string;
  body: string;
  metric?: keyof BrandedMetrics;
  tone: InsightTone;
  change?: number;
}

export interface GenerateInsightsOptions {
  latestMetrics: BrandedMetrics;
  baseline?: BaselineMetrics | null;
  trendAnalysis?: TrendAnalysis | null;
  history?: TrendDataPoint[];
}

const METRIC_THRESHOLD = 8;
const VOICE_IQ_TREND_THRESHOLD = 5;
const HEALTH_STREAK_MIN = 3;
const HEALTH_STREAK_FLOOR = 65;

function pushImprovement(insights: Insight[], metric: keyof BrandedMetrics, delta: number) {
  insights.push({
    id: `${metric}-improving`,
    category: 'whatsImproving',
    title: `${metricLabel(metric)} is up ${delta > 0 ? '+' : ''}${delta}`,
    body: 'Keep the habits that made this happen—consistency compounds.',
    metric,
    tone: 'celebration',
    change: delta,
  });
}

function pushWatch(insights: Insight[], metric: keyof BrandedMetrics, delta: number) {
  insights.push({
    id: `${metric}-watch`,
    category: 'whatToWatch',
    title: `${metricLabel(metric)} is trending down`,
    body: 'Give yourself recovery time and double-check hydration or technique.',
    metric,
    tone: 'warning',
    change: delta,
  });
}

function metricLabel(metric: keyof BrandedMetrics): string {
  switch (metric) {
    case 'clarity':
      return 'Clarity';
    case 'power':
      return 'Power';
    case 'health':
      return 'Vocal health';
    case 'warmth':
      return 'Warmth';
    case 'confidence':
      return 'Confidence';
    case 'expressiveness':
      return 'Expressiveness';
    case 'voiceIQ':
      return 'Voice IQ';
    default:
      return 'Metric';
  }
}

export function generateInsights(options: GenerateInsightsOptions): Insight[] {
  const { latestMetrics, baseline, trendAnalysis, history = [] } = options;
  const insights: Insight[] = [];

  if (baseline) {
    (['clarity', 'power', 'health', 'warmth', 'confidence', 'expressiveness'] as Array<keyof BrandedMetrics>).forEach((metric) => {
      const latest = latestMetrics[metric];
      const baselineValue = baseline[metric];
      if (baselineValue == null) return;
      const delta = Math.round(latest - baselineValue);
      if (delta >= METRIC_THRESHOLD) {
        pushImprovement(insights, metric, delta);
      } else if (delta <= -METRIC_THRESHOLD) {
        pushWatch(insights, metric, delta);
      }
    });
  }

  if (trendAnalysis?.sevenDay && trendAnalysis.thirtyDay) {
    const sevenVoiceIQ = trendAnalysis.sevenDay.average.voiceIQ;
    const thirtyVoiceIQ = trendAnalysis.thirtyDay.average.voiceIQ;
    const delta = Math.round(sevenVoiceIQ - thirtyVoiceIQ);
    if (Math.abs(delta) >= VOICE_IQ_TREND_THRESHOLD) {
      insights.push({
        id: 'voiceIQ-trend',
        category: delta >= 0 ? 'whatsImproving' : 'whatToWatch',
        title: delta >= 0 ? 'Voice IQ is climbing' : 'Voice IQ dipped this week',
        body:
          delta >= 0
            ? 'Last 7 days outperformed your 30-day average. Keep the routine that drove the gain.'
            : 'Recent recordings are under your 30-day average. Lighten the load and rehydrate.',
        metric: 'voiceIQ',
        tone: delta >= 0 ? 'celebration' : 'warning',
        change: delta,
      });
    }
  }

  const recentHealth = history
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, HEALTH_STREAK_MIN);
  if (recentHealth.length === HEALTH_STREAK_MIN && recentHealth.every((point) => point.metrics.health >= HEALTH_STREAK_FLOOR)) {
    insights.push({
      id: 'health-streak',
      category: 'streak',
      title: 'Vocal health streak',
      body: 'Three strong sessions in a row. Keep honoring cooldowns and hydration.',
      metric: 'health',
      tone: 'celebration',
    });
  }

  return insights;
}
