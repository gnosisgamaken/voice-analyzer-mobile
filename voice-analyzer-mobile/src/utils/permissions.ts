import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

export async function requestLocationPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    
    return {
      granted: status === 'granted',
      canAskAgain,
    };
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return {
      granted: false,
      canAskAgain: false,
    };
  }
}

export async function checkLocationPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
    
    return {
      granted: status === 'granted',
      canAskAgain,
    };
  } catch (error) {
    console.error('Error checking location permission:', error);
    return {
      granted: false,
      canAskAgain: false,
    };
  }
}

export async function ensureLocationPermission(): Promise<boolean> {
  const current = await checkLocationPermission();
  
  if (current.granted) {
    return true;
  }
  
  if (!current.canAskAgain) {
    return false;
  }
  
  const requested = await requestLocationPermission();
  return requested.granted;
}
