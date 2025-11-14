import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VoiceMetrics as VoiceMetricsType } from '../types';
import { interpretMetric } from '../utils/enhancedAudioAnalysis';

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
    <View style={styles.card}>
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
    </View>
  );
}

export default function VoiceMetrics({ metrics }: VoiceMetricsProps) {
  if (!metrics) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>Start recording to see voice metrics</Text>
      </View>
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
    paddingHorizontal: 16,
  },
  placeholder: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  interpretation: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F2F2F7',
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
    color: '#000000',
    width: 40,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
