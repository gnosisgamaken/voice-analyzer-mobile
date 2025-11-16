import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { MaterialCard } from '../components/MaterialCard';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import type { NavigationProp } from '../navigation/SimpleNavigator';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  requestNotificationPermission,
  getNotificationSettings,
  getScheduledNotifications,
  clearAllScheduledNotifications,
  type NotificationPreferences,
  type ScheduledNotification,
} from '../services/notificationService';

type FrequencyOption = NotificationPreferences['frequency'];

const FREQUENCY_OPTIONS: Array<{ label: string; value: FrequencyOption; helper: string }> = [
  { label: 'Daily', value: 'daily', helper: 'One calm check-in each day' },
  { label: 'Weekly', value: 'weekly', helper: 'Sunday evening status update' },
  { label: 'Off', value: 'off', helper: 'Silence all notifications' },
];

interface NotificationSettingsScreenProps {
  navigation: NavigationProp;
}

export default function NotificationSettingsScreen({ navigation }: NotificationSettingsScreenProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [scheduled, setScheduled] = useState<ScheduledNotification[]>([]);
  const [systemSettings, setSystemSettings] = useState<string>('Unknown');
  const [permissionLabel, setPermissionLabel] = useState('Status unknown');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [prefs, system, queued] = await Promise.all([
        getNotificationPreferences(),
        getNotificationSettings(),
        getScheduledNotifications(),
      ]);
      setPreferences(prefs);
      setSystemSettings(formatSystemSettings(system));
      setScheduled(queued);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleEnabled = async (value: boolean) => {
    setPreferences(prev => (prev ? { ...prev, enabled: value } : prev));
    const next = await updateNotificationPreferences({ enabled: value });
    setPreferences(next);
  };

  const handleFrequencyChange = async (value: FrequencyOption) => {
    setPreferences(prev => (prev ? { ...prev, frequency: value } : prev));
    const next = await updateNotificationPreferences({ frequency: value });
    setPreferences(next);
  };

  const handleHourChange = async (hour: number) => {
    const rounded = Math.round(hour);
    setPreferences(prev => (prev ? { ...prev, preferredHour: rounded } : prev));
    const next = await updateNotificationPreferences({ preferredHour: rounded });
    setPreferences(next);
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionLabel(granted ? 'Notifications enabled' : 'Permission denied');
    const system = await getNotificationSettings();
    setSystemSettings(formatSystemSettings(system));
  };

  const handleClearScheduled = async () => {
    await clearAllScheduledNotifications();
    setScheduled([]);
  };

  if (!preferences) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" translucent />
        <Text style={styles.loadingText}>{loading ? 'Loading preferences…' : 'Unable to load preferences'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent />
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Notifications</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MaterialCard style={styles.card} variant="regular">
          <Text style={styles.sectionTitle}>Smart nudges</Text>
          <Text style={styles.sectionHelper}>Value-forward reminders tailored to your sessions</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Enable notifications</Text>
            <Switch
              value={preferences.enabled}
              onValueChange={handleToggleEnabled}
              thumbColor={preferences.enabled ? COLORS.tintColor : '#f4f3f4'}
              trackColor={{ false: '#d1d1d6', true: '#d6e4ff' }}
            />
          </View>
          <Text style={styles.metaText}>System: {systemSettings}</Text>
          <Text style={styles.metaText}>Permission: {permissionLabel}</Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleRequestPermission}>
            <Text style={styles.secondaryButtonText}>Request permission</Text>
          </TouchableOpacity>
        </MaterialCard>

        <MaterialCard style={styles.card} variant="regular">
          <Text style={styles.sectionTitle}>Frequency</Text>
          <Text style={styles.sectionHelper}>Choose how often Voice Analyzer can reach out</Text>
          <View style={styles.frequencyGrid}>
            {FREQUENCY_OPTIONS.map(option => {
              const active = preferences.frequency === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.frequencyPill, active && styles.frequencyPillActive]}
                  onPress={() => handleFrequencyChange(option.value)}
                >
                  <Text style={[styles.frequencyLabel, active && styles.frequencyLabelActive]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.frequencyHelper, active && styles.frequencyHelperActive]}>
                    {option.helper}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </MaterialCard>

        <MaterialCard style={styles.card} variant="regular">
          <Text style={styles.sectionTitle}>Preferred time</Text>
          <Text style={styles.sectionHelper}>
            Voice Analyzer avoids quiet hours and targets your ideal reminder window.
          </Text>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Preferred hour</Text>
            <Text style={styles.sliderValue}>{formatHourLabel(preferences.preferredHour)}</Text>
          </View>
          <Slider
            minimumValue={5}
            maximumValue={22}
            step={1}
            value={preferences.preferredHour}
            onSlidingComplete={handleHourChange}
            minimumTrackTintColor={COLORS.tintColor}
            maximumTrackTintColor="#d1d1d6"
          />
          <Text style={styles.metaText}>Quiet hours respected automatically</Text>
        </MaterialCard>

        <MaterialCard style={styles.card} variant="regular">
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.sectionTitle}>Scheduled nudges</Text>
              <Text style={styles.sectionHelper}>
                Upcoming reminders queued locally. (max 1 per day)
              </Text>
            </View>
            <TouchableOpacity onPress={handleClearScheduled}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>
          {scheduled.length === 0 ? (
            <Text style={styles.metaText}>No notifications scheduled yet.</Text>
          ) : (
            scheduled.map(item => (
              <View key={item.id} style={styles.scheduledRow}>
                <View style={styles.scheduledBadge}>
                  <Text style={styles.scheduledBadgeText}>{formatTypeLabel(item.type)}</Text>
                </View>
                <View style={styles.scheduledInfo}>
                  <Text style={styles.scheduledTitle}>{item.title}</Text>
                  <Text style={styles.scheduledMeta}>
                    {new Date(item.scheduleAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </MaterialCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatHourLabel(hour: number): string {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date.toLocaleTimeString([], { hour: 'numeric' });
}

function formatTypeLabel(type: ScheduledNotification['type']): string {
  switch (type) {
    case 'celebration':
      return 'Win';
    case 'gentleReminder':
      return 'Reminder';
    case 'milestone':
      return 'Milestone';
    case 'valueForward':
    default:
      return 'Insight';
  }
}

function formatSystemSettings(settings: Record<string, unknown>): string {
  const keys = Object.entries(settings)
    .filter(([, value]) => value)
    .map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase());
  return keys.length ? keys.join(', ') : 'Alerts disabled at OS level';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondaryLabel,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.tintColor,
    fontWeight: '600',
  },
  topTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.label,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  card: {
    marginHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.label,
  },
  sectionHelper: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondaryLabel,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  rowLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.label,
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondaryLabel,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.tintColor,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.tintColor,
    fontWeight: '600',
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  frequencyPill: {
    flex: 1,
    minWidth: 100,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: SPACING.sm,
  },
  frequencyPillActive: {
    borderColor: COLORS.tintColor,
    backgroundColor: 'rgba(36,107,253,0.08)',
  },
  frequencyLabel: {
    ...TYPOGRAPHY.headline,
    fontSize: 16,
    color: COLORS.label,
  },
  frequencyLabelActive: {
    color: COLORS.tintColor,
  },
  frequencyHelper: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondaryLabel,
  },
  frequencyHelperActive: {
    color: COLORS.tintColor,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.label,
  },
  sliderValue: {
    ...TYPOGRAPHY.headline,
    color: COLORS.tintColor,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearButton: {
    ...TYPOGRAPHY.caption,
    color: COLORS.tintColor,
    fontWeight: '600',
  },
  scheduledRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  scheduledBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(36,107,253,0.1)',
  },
  scheduledBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.tintColor,
  },
  scheduledInfo: {
    flex: 1,
  },
  scheduledTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.label,
  },
  scheduledMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondaryLabel,
  },
});
