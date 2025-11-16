import type { BrandedMetrics } from './brandedMetricsEngine';
import type { BaselineMetrics } from './baselineMetrics';
import type { TrendAnalysis, TrendDataPoint } from './trendTracking';
import type { MetricKey } from '../content/metricEducation';

export type InsightCategory = 'whatsImproving' | 'whatToWatch' | 'streak' | 'correlation';
export type InsightTone = 'info' | 'warning' | 'celebration';

export interface Insight {
  id: string;
  category: InsightCategory;
  title: string;
  description: string;
  metric?: MetricKey | 'voiceIQ';
  tone: InsightTone;
  confidence: number; // 0-1
}

export interface GenerateInsightsOptions {
  latestMetrics: BrandedMetrics;
  baseline?: BaselineMetrics | null;
  trendAnalysis?: TrendAnalysis | null;
  history?: TrendDataPoint[];
}

/**
 * Main entry: generates a curated list of insights using baseline + trend data.
 */
export function generateInsights({
  latestMetrics,
  baseline,
  trendAnalysis,
  history = [],
}: GenerateInsightsOptions): Insight[] {
  const insights: Insight[] = [];

  insights.push(
    ...calculateBaselineDiffInsights(latestMetrics, baseline, 'clarity', 'Clarity'),
    ...calculateBaselineDiffInsights(latestMetrics, baseline, 'health', 'Health'),
    ...calculateBaselineDiffInsights(latestMetrics, baseline, 'voiceIQ', 'Voice IQ™')
  );

  if (trendAnalysis?.sevenDay && trendAnalysis.thirtyDay) {
    const seven = trendAnalysis.sevenDay.average.voiceIQ;
    const thirty = trendAnalysis.thirtyDay.average.voiceIQ;
    const delta = seven - thirty;
    if (Math.abs(delta) >= 5) {
      insights.push({
        id: createInsightId('voiceIQ-trend'),
        category: delta > 0 ? 'whatsImproving' : 'whatToWatch',
        title: delta > 0 ? 'Voice IQ is trending up' : 'Voice IQ dipped this week',
        description:
          delta > 0
            ? `Past 7 days improved ${delta} points vs your 30-day average. Whatever changed recently is working.`
            : `Voice IQ is ${Math.abs(delta)} points below your 30-day average. Consider lighter days or more recovery.`,
        metric: 'voiceIQ',
        tone: delta > 0 ? 'celebration' : 'warning',
        confidence: 0.7,
      });
    }
  }

  const streakInsight = detectStreakInsight(history);
  if (streakInsight) {
    insights.push(streakInsight);
  }

  const correlationInsight = detectDaypartCorrelation(history);
  if (correlationInsight) {
    insights.push(correlationInsight);
  }

  return insights.slice(0, 4);
}

function calculateBaselineDiffInsights(
  latest: BrandedMetrics,
  baseline: BaselineMetrics | null | undefined,
  key: keyof BrandedMetrics,
  label: string
): Insight[] {
  if (!baseline) return [];
  const latestValue = latest[key];
  const baselineValue = baseline[key];
  const delta = latestValue - baselineValue;
  if (Math.abs(delta) < 5) return [];

  const metricKey = key === 'voiceIQ' ? 'voiceIQ' : (key as MetricKey);
  const improving = delta > 0;

  return [
    {
      id: createInsightId(`${String(key)}-baseline`),
      category: improving ? 'whatsImproving' : 'whatToWatch',
      title: improving
        ? `${label} improved ${delta} pts vs baseline`
        : `${label} is ${Math.abs(delta)} pts below baseline`,
      description: improving
        ? 'Whatever prep you did before recording is strengthening this metric.'
        : 'Dial up rest, hydration, or warmups before the next session.',
      metric: metricKey,
      tone: improving ? 'info' : 'warning',
      confidence: 0.6,
    },
  ];
}

function detectStreakInsight(history: TrendDataPoint[]): Insight | null {
  if (history.length < 3) return null;
  const recent = history.slice(-3);
  const allHealthy = recent.every(point => point.metrics.health >= 60);
  if (allHealthy) {
    return {
      id: createInsightId('health-streak'),
      category: 'streak',
      title: 'Health stayed resilient 3 sessions in a row',
      description: 'Keep honoring the cooldowns and rest that made this happen.',
      metric: 'health',
      tone: 'celebration',
      confidence: 0.65,
    };
  }
  return null;
}

function detectDaypartCorrelation(history: TrendDataPoint[]): Insight | null {
  if (history.length < 6) return null;
  const buckets = {
    morning: [] as number[],
    afternoon: [] as number[],
    evening: [] as number[],
  };

  history.forEach(point => {
    const hour = new Date(point.timestamp).getHours();
    if (hour < 12) buckets.morning.push(point.metrics.voiceIQ);
    else if (hour < 18) buckets.afternoon.push(point.metrics.voiceIQ);
    else buckets.evening.push(point.metrics.voiceIQ);
  });

  const averages = Object.fromEntries(
    Object.entries(buckets).map(([label, values]) => [label, average(values)])
  ) as Record<keyof typeof buckets, number>;

  const bestBucket = Object.entries(averages).reduce((best, current) =>
    current[1] > best[1] ? current : best
  );

  const [bestLabel, bestValue] = bestBucket;
  const otherValues = Object.entries(averages)
    .filter(([label]) => label !== bestLabel)
    .map(([, value]) => value);
  const meanOthers = average(otherValues);

  if (bestValue - meanOthers < 5) return null;

  return {
    id: createInsightId(`daypart-${bestLabel}`),
    category: 'correlation',
    title: `Voice IQ loves the ${bestLabel}`,
    description: `Scores are about ${Math.round(bestValue - meanOthers)} pts higher during the ${bestLabel}.`,
    metric: 'voiceIQ',
    tone: 'info',
    confidence: 0.55,
  };
}

function average(values: number[]): number {
  if (!values.length) return 0;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return Math.round(sum / values.length);
}

function createInsightId(suffix: string): string {
  return `insight-${suffix}-${Date.now()}`;
}
