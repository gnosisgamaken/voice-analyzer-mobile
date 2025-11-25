import {
  generateInsights,
  type Insight,
} from '../insightsEngine';
import type { BrandedMetrics } from '../brandedMetricsEngine';
import type { BaselineMetrics } from '../baselineMetrics';
import type { TrendAnalysis, TrendDataPoint } from '../trendTracking';

const baseMetrics: BrandedMetrics = {
  clarity: 70,
  power: 70,
  health: 70,
  warmth: 70,
  confidence: 70,
  expressiveness: 70,
  voiceIQ: 70,
};

const baseBaseline: BaselineMetrics = {
  ...baseMetrics,
  recordingCount: 5,
  establishedAt: Date.now() - 86400000,
  lastUpdated: Date.now() - 3600000,
};

describe('generateInsights', () => {
  it('highlights improvements vs baseline', () => {
    const insights = generateInsights({
      latestMetrics: { ...baseMetrics, clarity: 85 },
      baseline: baseBaseline,
    });

    expect(insights.some(matchInsight('whatsImproving', 'clarity'))).toBe(true);
  });

  it('flags metrics below baseline', () => {
    const insights = generateInsights({
      latestMetrics: { ...baseMetrics, health: 50 },
      baseline: baseBaseline,
    });

    expect(insights.some(matchInsight('whatToWatch', 'health'))).toBe(true);
  });

  it('adds voice IQ trend insight when 7-day average changes significantly', () => {
    const trendAnalysis: TrendAnalysis = {
      sevenDay: {
        average: { ...baseMetrics, voiceIQ: 82 },
        dataPoints: [],
        startDate: 0,
        endDate: 0,
      },
      thirtyDay: {
        average: { ...baseMetrics, voiceIQ: 70 },
        dataPoints: [],
        startDate: 0,
        endDate: 0,
      },
      allTime: null,
    };

    const insights = generateInsights({
      latestMetrics: baseMetrics,
      trendAnalysis,
    });

    expect(insights.some(matchInsight('whatsImproving', 'voiceIQ'))).toBe(true);
  });

  it('detects health streaks from history', () => {
    const now = Date.now();
    const history: TrendDataPoint[] = [0, 1, 2].map(offset => ({
      timestamp: now - offset * 3600000,
      metrics: { ...baseMetrics, health: 70 + offset },
    }));

    const insights = generateInsights({
      latestMetrics: baseMetrics,
      history,
    });

    expect(insights.some(insight => insight.category === 'streak')).toBe(true);
  });
});

function matchInsight(category: Insight['category'], metric?: string) {
  return (insight: Insight) =>
    insight.category === category &&
    (metric ? insight.metric === metric : true);
}
