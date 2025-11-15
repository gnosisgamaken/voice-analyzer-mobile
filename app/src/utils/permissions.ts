import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';
import { logger } from './logger';

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

const isWeb = Platform.OS === 'web';

const getPermissionConstant = (type: 'location' | 'audio'): Permission | null => {
  if (Platform.OS === 'ios') {
    return type === 'location' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.IOS.MICROPHONE;
  }
  if (Platform.OS === 'android') {
    return type === 'location' ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : PERMISSIONS.ANDROID.RECORD_AUDIO;
  }
  return null;
};

const parseResult = (result: string): PermissionStatus => {
  return {
    granted: result === RESULTS.GRANTED || result === RESULTS.LIMITED,
    canAskAgain: result === RESULTS.DENIED || result === RESULTS.LIMITED,
  };
};

const handlePermission = async (type: 'location' | 'audio', action: 'check' | 'request'): Promise<PermissionStatus> => {
  if (isWeb) {
    return { granted: true, canAskAgain: false };
  }

  const permission = getPermissionConstant(type);
  if (!permission) {
    return { granted: false, canAskAgain: false };
  }

  try {
    const result = action === 'check' ? await check(permission) : await request(permission);
    return parseResult(result);
  } catch (error) {
    logger.error(`Error ${action}ing ${type} permission:`, error);
    return { granted: false, canAskAgain: false };
  }
};

export async function requestLocationPermission(): Promise<PermissionStatus> {
  return handlePermission('location', 'request');
}

export async function checkLocationPermission(): Promise<PermissionStatus> {
  return handlePermission('location', 'check');
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

export async function requestAudioPermission(): Promise<PermissionStatus> {
  return handlePermission('audio', 'request');
}

export async function checkAudioPermission(): Promise<PermissionStatus> {
  return handlePermission('audio', 'check');
}

export async function ensureAudioPermission(): Promise<boolean> {
  const current = await checkAudioPermission();
  if (current.granted) {
    return true;
  }
  if (!current.canAskAgain) {
    logger.warn('Audio permission denied - user must enable it in Settings.');
    return false;
  }
  const requested = await requestAudioPermission();
  return requested.granted;
}
