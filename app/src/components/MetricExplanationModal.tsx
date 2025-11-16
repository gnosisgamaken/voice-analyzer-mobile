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
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
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
    backgroundColor: COLORS.secondaryBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.select({ ios: SPACING.xxl, android: SPACING.lg }),
    maxHeight: '90%',
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignSelf: 'center',
    marginVertical: SPACING.sm,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
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
    ...TYPOGRAPHY.caption,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.secondaryLabel,
  },
  title: {
    ...TYPOGRAPHY.title2,
    color: COLORS.label,
  },
  headline: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondaryLabel,
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
    ...TYPOGRAPHY.caption,
    color: COLORS.secondaryLabel,
  },
  summary: {
    ...TYPOGRAPHY.body,
    color: COLORS.label,
  },
  section: {
    gap: SPACING.xs,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.label,
  },
  body: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondaryLabel,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingVertical: 4,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
  },
  useCases: {
    gap: SPACING.sm,
  },
  useCaseCard: {
    padding: SPACING.md,
    borderRadius: 16,
    backgroundColor: 'rgba(118,118,128,0.08)',
    gap: 4,
  },
  useCaseTitle: {
    ...TYPOGRAPHY.headline,
    fontSize: 16,
    color: COLORS.label,
  },
  footerCard: {
    marginTop: SPACING.sm,
    borderRadius: 18,
    padding: SPACING.md,
    backgroundColor: 'rgba(118,118,128,0.08)',
    gap: 6,
  },
  footerLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default MetricExplanationModal;
