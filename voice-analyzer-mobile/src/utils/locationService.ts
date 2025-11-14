import * as Location from 'expo-location';
import { ensureLocationPermission } from './permissions';

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
  formattedAddress?: string;
}

export async function getCurrentLocation(): Promise<LocationData | null> {
  try {
    const hasPermission = await ensureLocationPermission();
    
    if (!hasPermission) {
      console.warn('Location permission not granted');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;

    try {
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode) {
        return {
          latitude,
          longitude,
          city: geocode.city || geocode.subregion || undefined,
          region: geocode.region || undefined,
          country: geocode.country || undefined,
          formattedAddress: formatAddress(geocode),
        };
      }
    } catch (geocodeError) {
      console.warn('Reverse geocoding failed:', geocodeError);
    }

    return {
      latitude,
      longitude,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}

function formatAddress(geocode: Location.LocationGeocodedAddress): string {
  const parts: string[] = [];
  
  if (geocode.city || geocode.subregion) {
    parts.push(geocode.city || geocode.subregion || '');
  }
  
  if (geocode.region) {
    parts.push(geocode.region);
  }
  
  if (geocode.country) {
    parts.push(geocode.country);
  }
  
  return parts.filter(Boolean).join(', ');
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
