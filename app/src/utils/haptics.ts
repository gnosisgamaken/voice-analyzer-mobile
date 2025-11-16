import { Platform } from 'react-native';
import ReactNativeHapticFeedback, { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { logger } from './logger';

// Temporarily disable iOS haptics while AVAudioEngine / CoreHaptics conflict is investigated.
const HAPTICS_ENABLED = Platform.OS === 'android';

export const triggerHaptic = (style: HapticFeedbackTypes): void => {
  if (!HAPTICS_ENABLED) {
    return;
  }

  try {
    ReactNativeHapticFeedback.trigger(style, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  } catch (error) {
    logger.debug('Haptics unavailable:', error);
  }
};
