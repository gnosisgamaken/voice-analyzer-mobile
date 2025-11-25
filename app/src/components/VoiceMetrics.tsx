import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VoiceMetrics as VoiceMetricsType } from '../types';
import { interpretMetric } from '../utils/enhancedAudioAnalysis';
import { MaterialCard } from './MaterialCard';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';

interface VoiceMetricsProps {
  metrics: VoiceMetricsType | null;
}

interface MetricCardProps {
  name: string;
  value: number;
  label: string;
}

function MetricCard({ name, value, label }: MetricCardProps) {
  const { label: interpretation, color } = interpretMetric(name, value);
  const percentage = Math.round(value * 100);

  return (
    <MaterialCard style={styles.card} contentStyle={styles.cardContent}>
      <View style={styles.cardHeader}>
        <Text style={styles.metricName}>{label}</Text>
        <Text style={[styles.interpretation, { color }]}>{interpretation}</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${percentage}%`, backgroundColor: color }
            ]}
          />
        </View>
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
    </MaterialCard>
  );
}

export default function VoiceMetrics({ metrics }: VoiceMetricsProps) {
  if (!metrics) {
    return (
      <MaterialCard style={styles.placeholderCard} variant="regular">
        <Text style={styles.placeholder}>Start recording to see voice metrics</Text>
      </MaterialCard>
    );
  }

  return (
    <View style={styles.container}>
      <MetricCard name="brightness" value={metrics.brightness} label="Brightness" />
      <MetricCard name="clarity" value={metrics.clarity} label="Clarity" />
      <MetricCard name="richness" value={metrics.richness} label="Richness" />
      <MetricCard name="energy" value={metrics.energy} label="Energy" />
      <MetricCard name="pitchStability" value={metrics.pitchStability} label="Pitch Stability" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingHorizontal: SPACING.md,
  },
  placeholderCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  placeholder: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondaryLabel,
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricName: {
    ...TYPOGRAPHY.headline,
    color: COLORS.label,
  },
  interpretation: {
    ...TYPOGRAPHY.caption,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.label,
    width: 40,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
