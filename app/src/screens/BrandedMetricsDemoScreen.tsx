/**
 * Branded Metrics Demo Screen
 * 
 * Demonstrates the new BrandedMetricCard and VoiceIQDisplay components
 * with sample data from the brandedMetricsEngine
 * 
 * This is for Week 3 implementation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { BrandedMetricCard, VoiceIQDisplay } from '../components/BrandedMetricCard';
import { MaterialCard } from '../components/MaterialCard';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { calculateBrandedMetrics, getTrendIndicator } from '../utils/brandedMetricsEngine';
import type { VoiceMetrics } from '../types';

// Sample voice metrics for demonstration
const sampleVoiceMetrics: VoiceMetrics = {
  brightness: 2500,
  clarity: 75,
  richness: 80,
  energy: 0.7,
  pitchStability: 85,
  pitchRange: 8,
};

const previousVoiceMetrics: VoiceMetrics = {
  brightness: 2400,
  clarity: 70,
  richness: 75,
  energy: 0.65,
  pitchStability: 80,
  pitchRange: 7,
};

export default function BrandedMetricsDemoScreen() {
  const [showTrends, setShowTrends] = useState(false);

  // Calculate current and previous branded metrics
  const currentMetrics = calculateBrandedMetrics(sampleVoiceMetrics);
  const previousMetrics = calculateBrandedMetrics(previousVoiceMetrics);

  // Calculate trends
  const clarityTrend = getTrendIndicator(currentMetrics.clarity, previousMetrics.clarity);
  const powerTrend = getTrendIndicator(currentMetrics.power, previousMetrics.power);
  const healthTrend = getTrendIndicator(currentMetrics.health, previousMetrics.health);
  const warmthTrend = getTrendIndicator(currentMetrics.warmth, previousMetrics.warmth);
  const confidenceTrend = getTrendIndicator(currentMetrics.confidence, previousMetrics.confidence);
  const expressivenessTrend = getTrendIndicator(
    currentMetrics.expressiveness,
    previousMetrics.expressiveness
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <MaterialCard style={styles.heroCard} variant="regular" tint="rgba(255,255,255,0.78)">
            <Text style={styles.heroTitle}>Branded Metrics Demo</Text>
            <Text style={styles.heroSubtitle}>
              Showcasing the new 6 core metrics + Voice IQ™
            </Text>
            <Text style={styles.heroHelper}>
              Based on the Branded Metrics Engine implementation (Week 2 complete)
            </Text>
          </MaterialCard>

          {/* Toggle Trends */}
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowTrends(!showTrends)}
          >
            <Text style={styles.toggleText}>
              {showTrends ? '✓ Showing trends' : 'Show trends vs baseline'}
            </Text>
          </TouchableOpacity>

          {/* Voice IQ Hero */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Voice IQ™ Composite</Text>
            <VoiceIQDisplay
              score={currentMetrics.voiceIQ}
              onLearnMore={() => console.log('Learn more about Voice IQ')}
            />
          </View>

          {/* Six Branded Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Six Core Metrics</Text>
            <Text style={styles.sectionSubheader}>
              💎 Clarity • ⚡ Power • ❤️ Health • ☀️ Warmth • 👑 Confidence • 🔥 Expressiveness
            </Text>

            <View style={styles.metricsGrid}>
              <BrandedMetricCard
                metricName="clarity"
                score={currentMetrics.clarity}
                trend={showTrends ? clarityTrend : undefined}
                style={styles.metricCard}
              />

              <BrandedMetricCard
                metricName="power"
                score={currentMetrics.power}
                trend={showTrends ? powerTrend : undefined}
                style={styles.metricCard}
              />

              <BrandedMetricCard
                metricName="health"
                score={currentMetrics.health}
                trend={showTrends ? healthTrend : undefined}
                style={styles.metricCard}
              />

              <BrandedMetricCard
                metricName="warmth"
                score={currentMetrics.warmth}
                trend={showTrends ? warmthTrend : undefined}
                style={styles.metricCard}
              />

              <BrandedMetricCard
                metricName="confidence"
                score={currentMetrics.confidence}
                trend={showTrends ? confidenceTrend : undefined}
                style={styles.metricCard}
              />

              <BrandedMetricCard
                metricName="expressiveness"
                score={currentMetrics.expressiveness}
                trend={showTrends ? expressivenessTrend : undefined}
                style={styles.metricCard}
              />
            </View>
          </View>

          {/* Scores Summary */}
          <MaterialCard style={styles.summaryCard} variant="regular">
            <Text style={styles.summaryTitle}>Scores Summary</Text>
            <View style={styles.summaryGrid}>
              <SummaryRow label="💎 Clarity" score={currentMetrics.clarity} />
              <SummaryRow label="⚡ Power" score={currentMetrics.power} />
              <SummaryRow label="❤️ Health" score={currentMetrics.health} />
              <SummaryRow label="☀️ Warmth" score={currentMetrics.warmth} />
              <SummaryRow label="👑 Confidence" score={currentMetrics.confidence} />
              <SummaryRow label="🔥 Expressiveness" score={currentMetrics.expressiveness} />
              <View style={styles.divider} />
              <SummaryRow
                label="✨ Voice IQ™"
                score={currentMetrics.voiceIQ}
                highlight
              />
            </View>
          </MaterialCard>

          {/* Implementation Status */}
          <MaterialCard style={styles.statusCard} variant="regular">
            <Text style={styles.statusTitle}>✅ Implementation Status</Text>
            <Text style={styles.statusText}>
              • Branded Metrics Engine (Week 2): Complete{'\n'}
              • BrandedMetricCard component (Week 3): Complete{'\n'}
              • VoiceIQDisplay component (Week 3): Complete{'\n'}
              • Qualitative labels: Complete{'\n'}
              • Trend indicators: Complete{'\n'}
              • Test suite: 20/20 passing{'\n'}
              {'\n'}
              <Text style={styles.statusNext}>Next: Integrate with live audio recording</Text>
            </Text>
          </MaterialCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const SummaryRow: React.FC<{ label: string; score: number; highlight?: boolean }> = ({
  label,
  score,
  highlight,
}) => (
  <View style={styles.summaryRow}>
    <Text style={[styles.summaryLabel, highlight && styles.summaryLabelHighlight]}>{label}</Text>
    <Text style={[styles.summaryScore, highlight && styles.summaryScoreHighlight]}>{score}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
    paddingTop: SPACING.md,
  },
  heroCard: {
    marginHorizontal: SPACING.md,
  },
  heroTitle: {
    ...TYPOGRAPHY.largeTitle,
    color: COLORS.label,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.label,
    marginTop: SPACING.xs,
  },
  heroHelper: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondaryLabel,
    marginTop: SPACING.xs,
  },
  toggleButton: {
    marginHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: `${COLORS.tintColor}20`,
    borderRadius: 999,
    alignSelf: 'center',
  },
  toggleText: {
    ...TYPOGRAPHY.body,
    color: COLORS.tintColor,
    fontWeight: '600',
  },
  section: {
    gap: SPACING.sm,
  },
  sectionHeader: {
    ...TYPOGRAPHY.title3,
    color: COLORS.label,
    paddingHorizontal: SPACING.md,
  },
  sectionSubheader: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondaryLabel,
    paddingHorizontal: SPACING.md,
    marginTop: -SPACING.xs,
  },
  metricsGrid: {
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  metricCard: {
    // Individual metric card styles handled by component
  },
  summaryCard: {
    marginHorizontal: SPACING.md,
  },
  summaryTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.label,
    marginBottom: SPACING.sm,
  },
  summaryGrid: {
    gap: SPACING.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  summaryLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.label,
  },
  summaryLabelHighlight: {
    fontWeight: '700',
    fontSize: 16,
  },
  summaryScore: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondaryLabel,
    fontWeight: '600',
  },
  summaryScoreHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.separator,
    marginVertical: SPACING.xs,
  },
  statusCard: {
    marginHorizontal: SPACING.md,
  },
  statusTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.label,
    marginBottom: SPACING.sm,
  },
  statusText: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondaryLabel,
    lineHeight: 22,
  },
  statusNext: {
    color: COLORS.tintColor,
    fontWeight: '600',
  },
});
