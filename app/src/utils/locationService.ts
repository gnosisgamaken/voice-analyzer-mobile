import Geolocation from 'react-native-geolocation-service';
import { Platform } from 'react-native';
import { ensureLocationPermission } from './permissions';
import { logger } from './logger';

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
  formattedAddress?: string;
}

export async function getCurrentLocation(): Promise<LocationData | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const hasPermission = await ensureLocationPermission();
    if (!hasPermission) {
      logger.warn('Location permission not granted');
      return null;
    }

    return await new Promise<LocationData | null>((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          logger.error('Error getting location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          distanceFilter: 0,
        }
      );
    });
  } catch (error) {
    logger.error('Error getting location:', error);
    return null;
  }
}

export function generateRecordingName(location: LocationData | null, timestamp: number): string {
  const date = new Date(timestamp);
  const dateStr = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  if (location?.city) {
    return `${location.city} - ${dateStr} ${timeStr}`;
  }
  
  return `Recording - ${dateStr} ${timeStr}`;
}
