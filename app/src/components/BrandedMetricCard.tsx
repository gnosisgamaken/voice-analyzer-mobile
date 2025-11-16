/**
 * BrandedMetricCard Component
 * 
 * Displays a single branded metric with:
 * - Icon and name
 * - Large score (0-100)
 * - Qualitative label
 * - Progress bar
 * - Optional trend indicator
 * 
 * Based on Week 3 requirements from Master Roadmap
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { MaterialCard } from './MaterialCard';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { getBrandedMetricDetails } from '../utils/brandedMetricsEngine';

export interface BrandedMetricCardProps {
  metricName: 'clarity' | 'power' | 'health' | 'warmth' | 'confidence' | 'expressiveness';
  score: number;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    change: number;
    label: string;
  };
  style?: ViewStyle;
  onPress?: () => void;
}

export const BrandedMetricCard: React.FC<BrandedMetricCardProps> = ({
  metricName,
  score,
  trend,
  style,
  onPress,
}) => {
  const details = getBrandedMetricDetails(metricName, score);

  const cardContent = (
    <MaterialCard style={[styles.card, style]} contentStyle={styles.cardContent}>
      {/* Header: Icon + Name */}
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: `${details.color}20` }]}>
          <Text style={styles.icon}>{details.icon}</Text>
        </View>
        <Text style={styles.metricName}>{metricName.charAt(0).toUpperCase() + metricName.slice(1)}</Text>
      </View>

      {/* Score Section */}
      <View style={styles.scoreSection}>
        <Text style={[styles.score, { color: details.color }]}>{details.score}</Text>
        <Text style={styles.scoreLabel}>/100</Text>
        {trend && (
          <View style={styles.trendContainer}>
            <Text
              style={[
                styles.trendLabel,
                {
                  color:
                    trend.direction === 'up'
                      ? COLORS.success
                      : trend.direction === 'down'
                      ? COLORS.error
                      : COLORS.secondaryLabel,
                },
              ]}
            >
              {trend.label}
            </Text>
          </View>
        )}
      </View>

      {/* Qualitative Label */}
      <View style={[styles.labelPill, { backgroundColor: `${details.color}15` }]}>
        <View style={[styles.labelDot, { backgroundColor: details.color }]} />
        <Text style={[styles.labelText, { color: details.color }]}>{details.label}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, Math.max(0, details.score))}%`,
                backgroundColor: details.color,
              },
            ]}
          />
        </View>
      </View>

      {/* Description (subtle) */}
      <Text style={styles.description}>{details.description}</Text>

      {onPress && (
        <Text style={styles.learnMoreHint}>Tap to learn more →</Text>
      )}
    </MaterialCard>
  );

  if (!onPress) {
    return cardContent;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Learn more about ${metricName}`}
      style={({ pressed }) => (pressed ? { opacity: 0.96 } : undefined)}
    >
      {cardContent}
    </Pressable>
  );
};

/**
 * Voice IQ Display Component
 * Hero treatment for the composite Voice IQ score
 */
export interface VoiceIQDisplayProps {
  score: number;
  style?: ViewStyle;
  onLearnMore?: () => void;
}

export const VoiceIQDisplay: React.FC<VoiceIQDisplayProps> = ({ score, style, onLearnMore }) => {
  const details = getBrandedMetricDetails('voiceIQ', score);

  return (
    <MaterialCard style={[styles.voiceIQCard, style]} contentStyle={styles.voiceIQContent}>
      {/* Header */}
      <View style={styles.voiceIQHeader}>
        <Text style={styles.voiceIQIcon}>{details.icon}</Text>
        <View style={styles.voiceIQInfo}>
          <Text style={styles.voiceIQTitle}>Voice IQ™</Text>
          <Text style={styles.voiceIQSubtitle}>Your overall vocal quality</Text>
        </View>
      </View>

      {/* Large Score Circle */}
      <View style={styles.scoreCircle}>
        <View style={styles.scoreCircleInner}>
          <Text style={[styles.voiceIQScore, { color: details.color }]}>{details.score}</Text>
          <Text style={styles.voiceIQScoreLabel}>/100</Text>
        </View>

        {/* Progress Ring (simplified - full implementation would use SVG/Canvas) */}
        <View
          style={[
            styles.progressRing,
            {
              borderColor: `${details.color}30`,
              borderTopColor: details.color,
              transform: [{ rotate: `${String((details.score / 100) * 360)}deg` }],
            },
          ]}
        />
      </View>

      {/* Qualitative Label */}
      <View style={[styles.voiceIQLabelPill, { backgroundColor: `${details.color}15` }]}>
        <Text style={[styles.voiceIQLabelText, { color: details.color }]}>{details.label}</Text>
      </View>

      {/* Learn More (optional) */}
      {onLearnMore && (
        <Text style={styles.learnMore} onPress={onLearnMore}>
          Learn more →
        </Text>
      )}
    </MaterialCard>
  );
};

const styles = StyleSheet.create({
  // BrandedMetricCard Styles
  card: {
    borderRadius: 16,
  },
  cardContent: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  metricName: {
    ...TYPOGRAPHY.headline,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.label,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  score: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 52,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.secondaryLabel,
    marginBottom: 10,
  },
  trendContainer: {
    marginLeft: SPACING.xs,
    marginBottom: 10,
  },
  trendLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 14,
    fontWeight: '600',
  },
  labelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  labelText: {
    ...TYPOGRAPHY.caption,
    fontSize: 13,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(142,142,147,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  description: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.secondaryLabel,
    marginTop: 4,
  },

  // VoiceIQDisplay Styles
  voiceIQCard: {
    borderRadius: 20,
  },
  voiceIQContent: {
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.md,
  },
  voiceIQHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  voiceIQIcon: {
    fontSize: 32,
  },
  voiceIQInfo: {
    alignItems: 'flex-start',
  },
  voiceIQTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.label,
  },
  voiceIQSubtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 14,
    color: COLORS.secondaryLabel,
  },
  scoreCircle: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scoreCircleInner: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  voiceIQScore: {
    fontSize: 64,
    fontWeight: '700',
    lineHeight: 72,
  },
  voiceIQScoreLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.secondaryLabel,
    marginTop: -8,
  },
  progressRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    zIndex: 1,
  },
  voiceIQLabelPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  voiceIQLabelText: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  learnMore: {
    ...TYPOGRAPHY.caption,
    fontSize: 14,
    color: COLORS.tintColor,
    marginTop: SPACING.xs,
  },
  learnMoreHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.tintColor,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
});
