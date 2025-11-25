import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { DesignTokens } from '../design/tokens';
import { Typography } from '../design/typography';
import { MetricKey, metricEducationContent } from '../content/metricEducation';
import { getBrandedMetricDetails } from '../utils/brandedMetricsEngine';

interface MetricExplanationModalProps {
  visible: boolean;
  metricKey: MetricKey | null;
  score?: number;
  onClose: () => void;
}

export const MetricExplanationModal: React.FC<MetricExplanationModalProps> = ({
  visible,
  metricKey,
  score,
  onClose,
}) => {
  if (!metricKey) {
    return null;
  }

  const content = metricEducationContent[metricKey];
  const details = getBrandedMetricDetails(metricKey, typeof score === 'number' ? score : 75);

  return (
    <Modal
      animationType="slide"
      visible={visible}
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheetContainer}>
          <View style={styles.handle} />
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.header}>
              <View style={[styles.iconBadge, { backgroundColor: `${details.color}15` }]}>
                <Text style={styles.icon}>{details.icon}</Text>
              </View>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>Metric insight</Text>
                <Text style={styles.title}>{content.name}</Text>
                <Text style={styles.headline}>{content.headline}</Text>
              </View>
              {typeof score === 'number' && (
                <View style={[styles.scorePill, { borderColor: `${details.color}40` }]}>
                  <Text style={[styles.scoreValue, { color: details.color }]}>
                    {Math.round(score)}
                  </Text>
                  <Text style={styles.scoreSuffix}>/100</Text>
                </View>
              )}
            </View>

            <Text style={styles.summary}>{content.summary}</Text>

            <Section title="What this measures">
              <Text style={styles.body}>{content.whatItMeans}</Text>
            </Section>

            <Section title="Why it matters">
              {content.whyItMatters.map(item => (
                <Bullet key={item} color={details.color} text={item} />
              ))}
            </Section>

            <Section title="How to improve">
              {content.improvementTips.map(item => (
                <Bullet key={item} color={details.color} text={item} />
              ))}
            </Section>

            <Section title="Use cases">
              <View style={styles.useCases}>
                {content.useCases.map(useCase => (
                  <View key={useCase.title} style={styles.useCaseCard}>
                    <Text style={styles.useCaseTitle}>{useCase.title}</Text>
                    <Text style={styles.body}>{useCase.description}</Text>
                  </View>
                ))}
              </View>
            </Section>

            <View style={styles.footerCard}>
              <Text style={[styles.footerLabel, { color: details.color }]}>Remember</Text>
              <Text style={styles.body}>{content.friendlyReminder}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

interface BulletProps {
  text: string;
  color: string;
}

const Bullet: React.FC<BulletProps> = ({ text, color }) => (
  <View style={styles.bulletRow}>
    <View style={[styles.bulletDot, { backgroundColor: color }]} />
    <Text style={styles.body}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    backgroundColor: DesignTokens.colors.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.select({ ios: DesignTokens.spacing.xl, android: DesignTokens.spacing.lg }),
    maxHeight: '90%',
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignSelf: 'center',
    marginVertical: DesignTokens.spacing.sm,
  },
  content: {
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingBottom: DesignTokens.spacing.xl,
    gap: DesignTokens.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.md,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    ...Typography.caption1,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: DesignTokens.colors.textSecondary,
  },
  title: {
    ...Typography.title2,
    color: DesignTokens.colors.textPrimary,
  },
  headline: {
    ...Typography.body,
    color: DesignTokens.colors.textSecondary,
  },
  scorePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  scoreSuffix: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
  },
  summary: {
    ...Typography.body,
    color: DesignTokens.colors.textPrimary,
  },
  section: {
    gap: DesignTokens.spacing.xs,
  },
  sectionTitle: {
    ...Typography.title2,
    fontSize: 18, // headline equivalent
    color: DesignTokens.colors.textPrimary,
  },
  body: {
    ...Typography.body,
    color: DesignTokens.colors.textSecondary,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: DesignTokens.spacing.sm,
    paddingVertical: 4,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
  },
  useCases: {
    gap: DesignTokens.spacing.sm,
  },
  useCaseCard: {
    padding: DesignTokens.spacing.md,
    borderRadius: 16,
    backgroundColor: 'rgba(118,118,128,0.08)',
    gap: 4,
  },
  useCaseTitle: {
    ...Typography.title2,
    fontSize: 16,
    color: DesignTokens.colors.textPrimary,
  },
  footerCard: {
    marginTop: DesignTokens.spacing.sm,
    borderRadius: 18,
    padding: DesignTokens.spacing.md,
    backgroundColor: 'rgba(118,118,128,0.08)',
    gap: 6,
  },
  footerLabel: {
    ...Typography.caption1,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default MetricExplanationModal;
