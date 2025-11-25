import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { BrandedMetrics } from '../utils/VoiceMetricsEngine';
import { METRIC_DEFINITIONS, type MetricKey } from '../constants/metricDefinitions';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { MaterialCard } from './MaterialCard';

const DISPLAY_ORDER: MetricKey[] = [
  'voiceIQ',
  'clarity',
  'power',
  'health',
  'warmth',
  'confidence',
  'expressiveness',
];

interface BrandedMetricsOverviewProps {
  metrics: BrandedMetrics | null | undefined;
}

const METRIC_COLORS: Partial<Record<MetricKey, string>> = {
  voiceIQ: COLORS.primary,
  clarity: '#5A80FF',
  power: '#FF9F0A',
  health: '#FF453A',
  warmth: '#FFD60A',
  confidence: '#AF52DE',
  expressiveness: '#FF2D55',
};

const statusCopy: Record<string, string> = {
  simulated: 'Simulated — calibrate with a fresh take',
  calibrated: 'Calibrated',
};

export const BrandedMetricsOverview: React.FC<BrandedMetricsOverviewProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <MaterialCard style={styles.placeholderCard} variant="regular">
        <Text style={styles.placeholderText}>
          Record your voice to unlock Voice IQ™ and the six branded metrics.
        </Text>
      </MaterialCard>
    );
  }

  return (
    <View style={styles.grid}>
      {DISPLAY_ORDER.map((metricKey) => {
        const metricDefinition = METRIC_DEFINITIONS[metricKey];
        const score = metrics[metricKey];
        if (!score) return null;

        const hue = METRIC_COLORS[metricKey] ?? COLORS.primary;
        return (
          <MaterialCard key={metricKey} style={styles.card} contentStyle={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: `${hue}26` }]}>
                <Text style={styles.metricIcon}>{metricDefinition.icon}</Text>
              </View>
              <View style={styles.metricInfo}>
                <Text style={styles.metricName}>{metricDefinition.name}</Text>
                <Text style={[styles.tagline, { color: hue }]}>{metricDefinition.tagline}</Text>
              </View>
              <View style={styles.scoreWrapper}>
                <Text style={[styles.score, { color: COLORS.label }]}>{score.value}</Text>
                <Text style={styles.scoreLabel}>/100</Text>
              </View>
            </View>

            <View style={styles.statusRow}>
              <View style={[styles.statusPill, { backgroundColor: `${hue}1f` }]}>
                <View style={[styles.statusDot, { backgroundColor: hue }]} />
                <Text style={[styles.statusText, { color: hue }]}>{score.label}</Text>
              </View>
              <Text style={styles.statusMeta}>
                {statusCopy[score.status] ?? 'Live'}
              </Text>
            </View>

            {score.notes?.length ? (
              <View style={styles.notes}>
                {score.notes.map((note) => (
                  <Text key={note} style={styles.noteText}>
                    {note}
                  </Text>
                ))}
              </View>
            ) : null}
          </MaterialCard>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: 12,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  card: {
    borderRadius: 16,
  },
  cardContent: {
    padding: SPACING.md,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIcon: {
    fontSize: 24,
  },
  metricInfo: {
    flex: 1,
  },
  metricName: {
    ...TYPOGRAPHY.headline,
    color: COLORS.label,
  },
  tagline: {
    ...TYPOGRAPHY.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  score: {
    fontSize: 26,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 12,
    color: COLORS.secondaryLabel,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
  },
  statusMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondaryLabel,
  },
  notes: {
    padding: SPACING.sm,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    gap: 4,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.secondaryLabel,
  },
  placeholderCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  placeholderText: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    color: COLORS.secondaryLabel,
  },
});
