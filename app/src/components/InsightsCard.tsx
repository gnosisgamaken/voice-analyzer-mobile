import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCard } from './MaterialCard';
import { DesignTokens } from '../design/tokens';
import { Typography } from '../design/typography';
import type { Insight } from '../utils/insightsEngine';

interface InsightsCardProps {
  insights: Insight[];
  title?: string;
  subtitle?: string;
  style?: ViewStyle;
}

export function InsightsCard({ insights, title = 'Insights', subtitle, style }: InsightsCardProps) {
  if (!insights.length) {
    return null;
  }

  return (
    <MaterialCard style={StyleSheet.flatten([styles.card, style])} variant="glass-regular">
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.list}>
        {insights.map(insight => (
          <View key={insight.id} style={styles.row}>
            <View style={[styles.badge, { backgroundColor: `${getCategoryColor(insight.type)}20` }]}>
              <Text style={[styles.badgeText, { color: getCategoryColor(insight.type) }]}>
                {insight.type.toUpperCase()}
              </Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.rowTitle}>{insight.title}</Text>
              <Text style={styles.rowDescription}>{insight.body}</Text>
            </View>
          </View>
        ))}
      </View>
    </MaterialCard>
  );
}

const getCategoryColor = (type: Insight['type']) => {
  switch (type) {
    case 'improvement':
      return DesignTokens.colors.clarity;
    case 'maintenance':
      return DesignTokens.colors.power;
    case 'milestone':
      return DesignTokens.colors.tint;
    case 'behavior':
      return DesignTokens.colors.health;
    default:
      return DesignTokens.colors.textSecondary;
  }
};

const styles = StyleSheet.create({
  card: {
    gap: DesignTokens.spacing.xs,
  },
  title: {
    ...Typography.title2,
    fontSize: 20, // title3 equivalent
    color: DesignTokens.colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
    marginBottom: DesignTokens.spacing.xs,
  },
  list: {
    gap: DesignTokens.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(36,107,253,0.12)',
  },
  badgeText: {
    ...Typography.caption1,
    color: DesignTokens.colors.tint,
    fontWeight: '600',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    ...DesignTokens.typography.body,
    fontWeight: '600',
    color: DesignTokens.colors.textPrimary,
  },
  rowDescription: {
    ...Typography.caption1,
    fontSize: 14,
    color: DesignTokens.colors.textSecondary,
  },
});

export default InsightsCard;
