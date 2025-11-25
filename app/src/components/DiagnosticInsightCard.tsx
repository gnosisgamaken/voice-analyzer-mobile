import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { DesignTokens } from '../design/tokens';
import { Typography } from '../design/typography';
import { MaterialCard } from './MaterialCard';
import { LiquidGlassButton } from './LiquidGlassButton';
import type { 
  DiagnosticRiskAssessment, 
  RiskFactor 
} from '../utils/diagnosticBiomarkers';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DiagnosticInsightCardProps {
  assessment: DiagnosticRiskAssessment;
  onLearnMore?: (riskFactor: RiskFactor) => void;
  onShareReport?: () => void;
}

const RISK_COLORS = {
  low: DesignTokens.colors.health,
  moderate: DesignTokens.colors.expressiveness,
  elevated: DesignTokens.colors.power,
  high: DesignTokens.colors.error,
};

const RISK_LABELS = {
  low: 'Looking Good',
  moderate: 'Monitor Trends',
  elevated: 'Worth Attention',
  high: 'Consider Consultation',
};

const SEVERITY_COLORS = {
  normal: DesignTokens.colors.health,
  borderline: DesignTokens.colors.expressiveness,
  abnormal: DesignTokens.colors.error,
};

export function DiagnosticInsightCard({
  assessment,
  onLearnMore,
  onShareReport,
}: DiagnosticInsightCardProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => !prev);
  }, []);

  const riskColor = RISK_COLORS[assessment.overallRisk];
  const riskLabel = RISK_LABELS[assessment.overallRisk];
  const confidencePercent = Math.round(assessment.confidence * 100);

  const abnormalFactors = assessment.riskFactors.filter(f => f.severity === 'abnormal');
  const borderlineFactors = assessment.riskFactors.filter(f => f.severity === 'borderline');
  const normalFactors = assessment.riskFactors.filter(f => f.severity === 'normal');

  return (
    <MaterialCard variant="glass-regular" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.eyebrow}>Vocal Health Insights</Text>
          <View style={[styles.confidenceBadge]}>
            <Text style={styles.confidenceText}>{confidencePercent}% confidence</Text>
          </View>
        </View>
        
        <Pressable onPress={toggleExpanded} style={styles.summaryRow}>
          <View style={[styles.riskIndicator, { backgroundColor: riskColor }]} />
          <View style={styles.summaryContent}>
            <Text style={[styles.riskLabel, { color: riskColor }]}>{riskLabel}</Text>
            <Text style={styles.summaryText}>
              {abnormalFactors.length > 0 
                ? `${abnormalFactors.length} factor${abnormalFactors.length > 1 ? 's' : ''} need attention`
                : borderlineFactors.length > 0
                  ? `${borderlineFactors.length} factor${borderlineFactors.length > 1 ? 's' : ''} to monitor`
                  : 'All biomarkers within healthy range'}
            </Text>
          </View>
          <Text style={styles.expandIcon}>{expanded ? '−' : '+'}</Text>
        </Pressable>
      </View>

      {expanded && (
        <View style={styles.expandedContent}>
          {abnormalFactors.length > 0 && (
            <View style={styles.factorSection}>
              <Text style={[styles.sectionLabel, { color: SEVERITY_COLORS.abnormal }]}>
                Needs Attention
              </Text>
              {abnormalFactors.map((factor, index) => (
                <RiskFactorRow 
                  key={index} 
                  factor={factor} 
                  onLearnMore={onLearnMore}
                />
              ))}
            </View>
          )}

          {borderlineFactors.length > 0 && (
            <View style={styles.factorSection}>
              <Text style={[styles.sectionLabel, { color: SEVERITY_COLORS.borderline }]}>
                Worth Monitoring
              </Text>
              {borderlineFactors.map((factor, index) => (
                <RiskFactorRow 
                  key={index} 
                  factor={factor} 
                  onLearnMore={onLearnMore}
                />
              ))}
            </View>
          )}

          {normalFactors.length > 0 && (
            <View style={styles.factorSection}>
              <Text style={[styles.sectionLabel, { color: SEVERITY_COLORS.normal }]}>
                Healthy Range
              </Text>
              {normalFactors.map((factor, index) => (
                <RiskFactorRow 
                  key={index} 
                  factor={factor} 
                  onLearnMore={onLearnMore}
                  compact
                />
              ))}
            </View>
          )}

          {assessment.recommendations.length > 0 && (
            <View style={styles.recommendationsSection}>
              <Text style={styles.recommendationsTitle}>Recommendations</Text>
              {assessment.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationRow}>
                  <Text style={styles.recommendationBullet}>•</Text>
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>
          )}

          {onShareReport && (
            <View style={styles.actionRow}>
              <LiquidGlassButton
                title="Share Vocal Report"
                onPress={onShareReport}
                variant="tinted"
                size="medium"
                fullWidth
                hapticType="selection"
              />
            </View>
          )}

          <Text style={styles.disclaimer}>
            This analysis is for informational purposes only and does not constitute medical advice. 
            Consult a healthcare professional for clinical evaluation.
          </Text>
        </View>
      )}
    </MaterialCard>
  );
}

interface RiskFactorRowProps {
  factor: RiskFactor;
  onLearnMore?: (factor: RiskFactor) => void;
  compact?: boolean;
}

function RiskFactorRow({ factor, onLearnMore, compact = false }: RiskFactorRowProps) {
  const severityColor = SEVERITY_COLORS[factor.severity];
  const isInRange = factor.value >= factor.normalRange[0] && factor.value <= factor.normalRange[1];
  
  const progressWidth = Math.min(
    100,
    Math.max(0, ((factor.value - factor.normalRange[0]) / 
      (factor.normalRange[1] - factor.normalRange[0])) * 100)
  );

  return (
    <Pressable 
      style={[styles.factorRow, compact && styles.factorRowCompact]}
      onPress={() => onLearnMore?.(factor)}
    >
      <View style={styles.factorHeader}>
        <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
        <Text style={styles.factorName}>{factor.name}</Text>
        <Text style={[styles.factorValue, { color: severityColor }]}>
          {typeof factor.value === 'number' 
            ? factor.value.toFixed(factor.value < 1 ? 2 : 1) 
            : factor.value}
        </Text>
      </View>
      
      {!compact && (
        <>
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View 
                style={[
                  styles.progressNormalRange,
                  { 
                    left: '0%', 
                    right: '0%',
                    backgroundColor: `${DesignTokens.colors.health}30`,
                  }
                ]} 
              />
              <View 
                style={[
                  styles.progressIndicator,
                  { 
                    left: `${Math.min(100, Math.max(0, progressWidth))}%`,
                    backgroundColor: severityColor,
                  }
                ]} 
              />
            </View>
            <Text style={styles.rangeLabel}>
              Normal: {factor.normalRange[0].toFixed(1)} - {factor.normalRange[1].toFixed(1)}
            </Text>
          </View>
          
          {factor.clinicalNote && (
            <Text style={styles.clinicalNote}>{factor.clinicalNote}</Text>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: DesignTokens.spacing.sm,
  },
  header: {
    gap: DesignTokens.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confidenceBadge: {
    paddingHorizontal: DesignTokens.spacing.xs,
    paddingVertical: 2,
    borderRadius: DesignTokens.radii.sm,
    backgroundColor: DesignTokens.colors.bgGlass,
  },
  confidenceText: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
    paddingVertical: DesignTokens.spacing.xs,
  },
  riskIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  summaryContent: {
    flex: 1,
    gap: 2,
  },
  riskLabel: {
    ...Typography.headline,
    fontSize: 18,
  },
  summaryText: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
  },
  expandIcon: {
    fontSize: 24,
    color: DesignTokens.colors.textSecondary,
    width: 28,
    textAlign: 'center',
  },
  expandedContent: {
    marginTop: DesignTokens.spacing.md,
    gap: DesignTokens.spacing.lg,
  },
  factorSection: {
    gap: DesignTokens.spacing.sm,
  },
  sectionLabel: {
    ...Typography.caption1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  factorRow: {
    backgroundColor: DesignTokens.colors.bgGlass,
    borderRadius: DesignTokens.radii.sm,
    padding: DesignTokens.spacing.sm,
    gap: DesignTokens.spacing.xs,
  },
  factorRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: DesignTokens.spacing.xs,
  },
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  factorName: {
    ...Typography.body,
    flex: 1,
    color: DesignTokens.colors.textPrimary,
  },
  factorValue: {
    ...Typography.headline,
  },
  progressContainer: {
    gap: 4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: DesignTokens.colors.separator,
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  progressNormalRange: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 3,
  },
  progressIndicator: {
    position: 'absolute',
    top: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: -5,
    borderWidth: 2,
    borderColor: DesignTokens.colors.bgSecondary,
  },
  rangeLabel: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
  },
  clinicalNote: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
    fontStyle: 'italic',
  },
  recommendationsSection: {
    gap: DesignTokens.spacing.xs,
    padding: DesignTokens.spacing.sm,
    backgroundColor: DesignTokens.colors.bgGlass,
    borderRadius: DesignTokens.radii.sm,
  },
  recommendationsTitle: {
    ...Typography.headline,
    color: DesignTokens.colors.textPrimary,
    marginBottom: DesignTokens.spacing.xs,
  },
  recommendationRow: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.xs,
  },
  recommendationBullet: {
    ...Typography.body,
    color: DesignTokens.colors.tint,
  },
  recommendationText: {
    ...Typography.body,
    color: DesignTokens.colors.textPrimary,
    flex: 1,
  },
  actionRow: {
    marginTop: DesignTokens.spacing.sm,
  },
  disclaimer: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
  },
});

export default DiagnosticInsightCard;
