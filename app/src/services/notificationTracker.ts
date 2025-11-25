import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFIED_EVENTS_KEY = '@voice_analyzer/notified_events';

type NotifiedEvents = Record<string, number>;

async function getEventMap(): Promise<NotifiedEvents> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFIED_EVENTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

async function saveEventMap(map: NotifiedEvents): Promise<void> {
  await AsyncStorage.setItem(NOTIFIED_EVENTS_KEY, JSON.stringify(map));
}

export async function wasEventNotified(event: string, freshnessMs?: number): Promise<boolean> {
  const map = await getEventMap();
  const timestamp = map[event];
  if (!timestamp) {
    return false;
  }
  if (freshnessMs && Date.now() - timestamp > freshnessMs) {
    return false;
  }
  return true;
}

export async function markEventNotified(event: string): Promise<void> {
  const map = await getEventMap();
  map[event] = Date.now();
  await saveEventMap(map);
}
