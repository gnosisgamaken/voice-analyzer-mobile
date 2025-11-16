import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  checkNotifications,
  requestNotifications,
  RESULTS,
  type NotificationSettings,
} from 'react-native-permissions';

export type NotificationType = 'valueForward' | 'celebration' | 'gentleReminder' | 'milestone';

export interface NotificationPayload {
  id?: string;
  type: NotificationType;
  title: string;
  body: string;
  scheduleAt: number; // epoch ms
  meta?: Record<string, unknown>;
}

export interface NotificationPreferences {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'off';
  preferredHour: number; // 0-23
  timezoneOffsetMinutes: number;
  quietHours?: {
    start: number; // 0-23
    end: number; // 0-23
  };
}

export interface ScheduledNotification extends NotificationPayload {
  id: string;
  createdAt: number;
  delivered?: boolean;
}

const PREFS_KEY = '@voice_analyzer/notification_prefs';
const SCHEDULE_KEY = '@voice_analyzer/scheduled_notifications';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  frequency: 'weekly',
  preferredHour: 9,
  timezoneOffsetMinutes: new Date().getTimezoneOffset(),
};

/**
 * Requests notification permission from the system.
 * Returns true when the user grants authorization.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await requestNotifications(['alert', 'sound', 'badge']);
  return status === RESULTS.GRANTED;
}

/**
 * Checks current notification settings.
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  const result = await checkNotifications();
  return result.settings;
}

/**
 * Retrieves stored notification preferences or falls back to defaults.
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const prefsJson = await AsyncStorage.getItem(PREFS_KEY);
    if (prefsJson) {
      return JSON.parse(prefsJson);
    }
  } catch (error) {
    console.warn('Failed to load notification preferences', error);
  }
  return DEFAULT_PREFERENCES;
}

/**
 * Updates notification preferences and persists them.
 */
export async function updateNotificationPreferences(
  update: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const current = await getNotificationPreferences();
  const merged = { ...current, ...update };
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(merged));
  return merged;
}

/**
 * Adds a scheduled notification to persistent storage.
 * A real push/local notification integration can later read from here.
 */
export async function scheduleNotification(
  payload: NotificationPayload
): Promise<ScheduledNotification> {
  const prefs = await getNotificationPreferences();
  if (!prefs.enabled || prefs.frequency === 'off') {
    throw new Error('Notifications disabled by user preferences');
  }

  if (!isWithinAllowedWindow(payload.scheduleAt, prefs)) {
    payload.scheduleAt = alignToPreferredHour(payload.scheduleAt, prefs.preferredHour);
  }

  const stored = await AsyncStorage.getItem(SCHEDULE_KEY);
  const notifications: ScheduledNotification[] = stored ? JSON.parse(stored) : [];
  const entry: ScheduledNotification = {
    ...payload,
    id: payload.id ?? generateNotificationId(),
    createdAt: Date.now(),
  };
  notifications.push(entry);
  await AsyncStorage.setItem(SCHEDULE_KEY, JSON.stringify(notifications));
  return entry;
}

/**
 * Returns all locally scheduled notifications.
 */
export async function getScheduledNotifications(): Promise<ScheduledNotification[]> {
  try {
    const stored = await AsyncStorage.getItem(SCHEDULE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to retrieve scheduled notifications', error);
    return [];
  }
}

/**
 * Cancels a scheduled notification by ID.
 */
export async function cancelScheduledNotification(id: string): Promise<void> {
  const notifications = await getScheduledNotifications();
  const filtered = notifications.filter(notification => notification.id !== id);
  await AsyncStorage.setItem(SCHEDULE_KEY, JSON.stringify(filtered));
}

export async function clearAllScheduledNotifications(): Promise<void> {
  await AsyncStorage.removeItem(SCHEDULE_KEY);
}

/**
 * Helper: aligns timestamp to preferred hour to avoid night-time nudges.
 */
function alignToPreferredHour(timestamp: number, preferredHour: number): number {
  const date = new Date(timestamp);
  date.setHours(preferredHour, 0, 0, 0);
  if (date.getTime() < Date.now()) {
    date.setDate(date.getDate() + 1);
  }
  return date.getTime();
}

function isWithinAllowedWindow(timestamp: number, prefs: NotificationPreferences): boolean {
  const date = new Date(timestamp);
  const hour = date.getHours();

  if (prefs.quietHours) {
    const { start, end } = prefs.quietHours;
    if (start < end) {
      if (hour >= start && hour < end) {
        return false;
      }
    } else {
      if (hour >= start || hour < end) {
        return false;
      }
    }
  }
  return true;
}

function generateNotificationId(): string {
  return `va-notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Simple helper to craft friendly preset payloads.
 */
export function buildGentleReminderPayload(lastRecordedAt?: number): NotificationPayload {
  const baseBody = lastRecordedAt
    ? "It's been a week since your last check-in. Want to see what changed?"
    : 'Ready to see how your voice is trending this week?';

  return {
    type: 'gentleReminder',
    title: 'Your voice has a new chapter waiting.',
    body: baseBody,
    scheduleAt: Date.now() + 1000 * 60 * 60 * 24, // default to tomorrow
  };
}

export function buildCelebrationPayload(metricLabel: string, score: number): NotificationPayload {
  return {
    type: 'celebration',
    title: 'Milestone moment ✨',
    body: `${metricLabel} reached ${score}. Take a moment to mark what worked.`,
    scheduleAt: Date.now() + 1000 * 60 * 5,
  };
}
