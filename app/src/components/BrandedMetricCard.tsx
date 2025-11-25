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
import { View, Text, StyleSheet, ViewStyle, Pressable, Dimensions } from 'react-native';
import { MaterialCard } from './MaterialCard';
import { DesignTokens } from '../design/tokens';
import { Typography } from '../design/typography';
import { getBrandedMetricDetails } from '../utils/brandedMetricsEngine';

const SCREEN_HEIGHT = Dimensions.get('window').height;

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
    <MaterialCard style={StyleSheet.flatten([styles.card, style])} contentStyle={styles.cardContent}>
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
                      ? DesignTokens.colors.health
                      : trend.direction === 'down'
                        ? DesignTokens.colors.error
                        : DesignTokens.colors.textSecondary,
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
 * When isHero=true, takes up ~80% of viewport height
 */
export interface VoiceIQDisplayProps {
  score: number;
  style?: ViewStyle;
  isHero?: boolean;
  onLearnMore?: () => void;
}

const HERO_CIRCLE_SIZE = Math.min(300, SCREEN_HEIGHT * 0.35);

export const VoiceIQDisplay: React.FC<VoiceIQDisplayProps> = ({ score, style, isHero = false, onLearnMore }) => {
  const details = getBrandedMetricDetails('voiceIQ', score);

  const cardStyle = isHero
    ? StyleSheet.flatten([styles.voiceIQCard, style])
    : StyleSheet.flatten([styles.voiceIQCard, style]);

  const circleSize = isHero ? HERO_CIRCLE_SIZE : 180;
  const scoreSize = isHero ? 80 : 64;
  const ringWidth = isHero ? 10 : 8;

  return (
    <MaterialCard style={cardStyle} contentStyle={styles.voiceIQContent}>
      <View style={styles.voiceIQHeader}>
        <Text style={[styles.voiceIQIcon, isHero && styles.voiceIQIconHero]}>{details.icon}</Text>
        <View style={styles.voiceIQInfo}>
          <Text style={[styles.voiceIQTitle, isHero && styles.voiceIQTitleHero]}>Voice IQ™</Text>
          <Text style={styles.voiceIQSubtitle}>Your overall vocal quality</Text>
        </View>
      </View>

      <View style={[styles.scoreCircle, { width: circleSize, height: circleSize }]}>
        <View style={styles.scoreCircleInner}>
          <Text style={[styles.voiceIQScore, { color: details.color, fontSize: scoreSize }]}>{details.score}</Text>
          <Text style={[styles.voiceIQScoreLabel, isHero && { fontSize: 22 }]}>/100</Text>
        </View>

        <View
          style={[
            styles.progressRing,
            {
              width: circleSize - 20,
              height: circleSize - 20,
              borderRadius: (circleSize - 20) / 2,
              borderWidth: ringWidth,
              borderColor: `${details.color}30`,
              borderTopColor: details.color,
              transform: [{ rotate: `${String((details.score / 100) * 360)}deg` }],
            },
          ]}
        />
      </View>

      <View style={[styles.voiceIQLabelPill, { backgroundColor: `${details.color}15` }, isHero && styles.voiceIQLabelPillHero]}>
        <Text style={[styles.voiceIQLabelText, { color: details.color }, isHero && styles.voiceIQLabelTextHero]}>{details.label}</Text>
      </View>

      {onLearnMore && (
        <Text style={[styles.learnMore, isHero && styles.learnMoreHero]} onPress={onLearnMore}>
          Tap to learn more →
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
    padding: DesignTokens.spacing.md,
    gap: DesignTokens.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
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
    ...Typography.title2,
    fontSize: 18,
    fontWeight: '600',
    color: DesignTokens.colors.textPrimary,
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
    color: DesignTokens.colors.textSecondary,
    marginBottom: 10,
  },
  trendContainer: {
    marginLeft: DesignTokens.spacing.xs,
    marginBottom: 10,
  },
  trendLabel: {
    ...DesignTokens.typography.caption1,
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
    ...Typography.caption1,
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
    ...Typography.caption2,
    fontSize: 12,
    color: DesignTokens.colors.textSecondary,
    marginTop: 4,
  },

  // VoiceIQDisplay Styles
  voiceIQCard: {
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
  },
  voiceIQContent: {
    padding: DesignTokens.spacing.lg,
    alignItems: 'center',
    gap: DesignTokens.spacing.md,
    justifyContent: 'center',
  },
  voiceIQHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
  },
  voiceIQIcon: {
    fontSize: 32,
  },
  voiceIQIconHero: {
    fontSize: 44,
  },
  voiceIQInfo: {
    alignItems: 'flex-start',
  },
  voiceIQTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: DesignTokens.colors.textPrimary,
  },
  voiceIQTitleHero: {
    fontSize: 32,
  },
  voiceIQSubtitle: {
    ...Typography.caption1,
    fontSize: 14,
    color: DesignTokens.colors.textSecondary,
  },
  scoreCircle: {
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
    fontWeight: '700',
    lineHeight: undefined,
  },
  voiceIQScoreLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: DesignTokens.colors.textSecondary,
    marginTop: -8,
  },
  progressRing: {
    position: 'absolute',
    zIndex: 1,
  },
  voiceIQLabelPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  voiceIQLabelPillHero: {
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  voiceIQLabelText: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  voiceIQLabelTextHero: {
    fontSize: 18,
  },
  learnMore: {
    ...Typography.caption1,
    fontSize: 14,
    color: DesignTokens.colors.tint,
    marginTop: DesignTokens.spacing.xs,
  },
  learnMoreHero: {
    fontSize: 16,
    marginTop: DesignTokens.spacing.md,
  },
  learnMoreHint: {
    ...Typography.caption1,
    color: DesignTokens.colors.tint,
    marginTop: DesignTokens.spacing.xs,
    fontWeight: '600',
  },
});
