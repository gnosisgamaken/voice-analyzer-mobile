import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Platform,
  Animated,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { MaterialCard } from '../components/MaterialCard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import { LargeTitleHeader } from '../components/LargeTitleHeader';
import { DesignTokens } from '../design/tokens';
import { Typography } from '../design/typography';

import SFSymbol from '../components/SFSymbol';
import type { NotificationsStackParamList } from '../navigation/types';

type FrequencyOption = NotificationPreferences['frequency'];

const FREQUENCY_OPTIONS: Array<{ label: string; value: FrequencyOption; helper: string }> = [
  { label: 'Daily', value: 'daily', helper: 'One calm check-in each day' },
  { label: 'Weekly', value: 'weekly', helper: 'Sunday evening status update' },
  { label: 'Off', value: 'off', helper: 'Silence all notifications' },
];

type NotificationSettingsScreenProps = NativeStackScreenProps<NotificationsStackParamList, 'NotificationSettings'>;

export default function NotificationSettingsScreen({ navigation }: NotificationSettingsScreenProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [scheduled, setScheduled] = useState<ScheduledNotification[]>([]);
  const [systemSettings, setSystemSettings] = useState<string>('Unknown');
  const [permissionLabel, setPermissionLabel] = useState('Status unknown');
  const [loading, setLoading] = useState(true);
  const scrollOffsetY = useRef(new Animated.Value(0)).current; // Static header offset

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
      <View style={styles.loadingContainer}>
        <StatusBar barStyle={DesignTokens.isDarkMode ? 'light-content' : 'dark-content'} translucent />
        <Text style={styles.loadingText}>{loading ? 'Loading preferences…' : 'Unable to load preferences'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={DesignTokens.isDarkMode ? 'light-content' : 'dark-content'} translucent />
      <LargeTitleHeader
        title="Notifications"
        scrollOffsetY={scrollOffsetY}
        leadingIcon={
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <SFSymbol name="chevron.backward" style={styles.backButtonIcon} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MaterialCard style={styles.card} variant="solid-elevated">
          <Text style={styles.sectionTitle}>Smart nudges</Text>
          <Text style={styles.sectionHelper}>Value-forward reminders tailored to your sessions</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Enable notifications</Text>
            <Switch
              value={preferences.enabled}
              onValueChange={handleToggleEnabled}
              thumbColor={preferences.enabled ? DesignTokens.colors.tint : '#f4f3f4'}
              trackColor={{ false: '#d1d1d6', true: DesignTokens.isDarkMode ? '#2c2c2e' : '#d6e4ff' }}
              ios_backgroundColor="#3e3e41"
            />
          </View>
          <Text style={styles.metaText}>System: {systemSettings}</Text>
          <Text style={styles.metaText}>Permission: {permissionLabel}</Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleRequestPermission}>
            <Text style={styles.secondaryButtonText}>Request permission</Text>
          </TouchableOpacity>
        </MaterialCard>

        <MaterialCard style={styles.card} variant="solid-elevated">
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

        <MaterialCard style={styles.card} variant="solid-elevated">
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
            minimumTrackTintColor={DesignTokens.colors.tint}
            maximumTrackTintColor={DesignTokens.isDarkMode ? '#444' : '#d1d1d6'}
            thumbTintColor={Platform.OS === 'android' ? DesignTokens.colors.tint : undefined}
          />
          <Text style={styles.metaText}>Quiet hours respected automatically</Text>
        </MaterialCard>

        <MaterialCard style={styles.card} variant="solid-elevated">
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
    </View>
  );
}

// ... (helper functions remain the same)
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
    backgroundColor: DesignTokens.colors.bgPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.bgPrimary,
  },
  loadingText: {
    ...Typography.body,
    color: DesignTokens.colors.textSecondary,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
  },
  backButtonIcon: {
    fontSize: 22,
    color: DesignTokens.colors.tint,
  },
  backButtonText: {
    ...Typography.body,
    color: DesignTokens.colors.tint,
    fontWeight: '600',
  },
  scrollContent: {
    paddingTop: 120, // HEADER_MAX_HEIGHT
    paddingBottom: DesignTokens.spacing.xl,
    gap: DesignTokens.spacing.lg,
  },
  card: {
    marginHorizontal: DesignTokens.spacing.md,
    gap: DesignTokens.spacing.sm,
  },
  sectionTitle: {
    ...Typography.title2,
    color: DesignTokens.colors.textPrimary,
  },
  sectionHelper: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: DesignTokens.spacing.sm,
  },
  rowLabel: {
    ...Typography.body,
    color: DesignTokens.colors.textPrimary,
  },
  metaText: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    marginTop: DesignTokens.spacing.sm,
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
    borderRadius: DesignTokens.radii.pill,
    borderWidth: 1,
    borderColor: DesignTokens.colors.tint,
  },
  secondaryButtonText: {
    ...Typography.caption1,
    color: DesignTokens.colors.tint,
    fontWeight: '600',
  },
  frequencyGrid: {
    flexDirection: 'column',
    gap: DesignTokens.spacing.sm,
    marginTop: DesignTokens.spacing.sm,
  },
  frequencyPill: {
    borderRadius: DesignTokens.radii.lg,
    borderWidth: 1,
    borderColor: DesignTokens.isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
    padding: DesignTokens.spacing.md,
    backgroundColor: DesignTokens.isDarkMode ? DesignTokens.colors.bgPrimary : DesignTokens.colors.bgCard,
  },
  frequencyPillActive: {
    borderColor: DesignTokens.colors.tint,
    backgroundColor: DesignTokens.isDarkMode ? 'rgba(82,139,255,0.2)' : 'rgba(36,107,253,0.08)',
  },
  frequencyLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: DesignTokens.colors.textPrimary,
  },
  frequencyLabelActive: {
    color: DesignTokens.colors.tint,
  },
  frequencyHelper: {
    ...Typography.caption1,
    color: DesignTokens.colors.textSecondary,
  },
  frequencyHelperActive: {
    color: DesignTokens.colors.tint,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabel: {
    ...Typography.body,
    color: DesignTokens.colors.textPrimary,
  },
  sliderValue: {
    ...Typography.title2,
    fontWeight: '600',
    color: DesignTokens.colors.tint,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearButton: {
    ...Typography.caption1,
    color: DesignTokens.colors.tint,
    fontWeight: '600',
  },
  scheduledRow: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.sm,
    paddingVertical: DesignTokens.spacing.xs,
    alignItems: 'center',
  },
  scheduledBadge: {
    paddingHorizontal: DesignTokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: DesignTokens.radii.pill,
    backgroundColor: DesignTokens.isDarkMode ? 'rgba(82,139,255,0.2)' : 'rgba(36,107,253,0.1)',
  },
  scheduledBadgeText: {
    ...Typography.caption2,
    color: DesignTokens.colors.tint,
    fontWeight: '600',
  },
  scheduledInfo: {
    flex: 1,
  },
  scheduledTitle: {
    ...Typography.body,
    color: DesignTokens.colors.textPrimary,
  },
  scheduledMeta: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
  },
});
