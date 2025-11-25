import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import HapticFeedback, { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { logger } from '../utils/logger';

const DEFAULT_OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export type HapticIntent =
  | 'selection'
  | 'impactLight'
  | 'impactMedium'
  | 'impactHeavy'
  | 'success'
  | 'warning'
  | 'error';

const INTENT_TO_TYPE: Record<HapticIntent, HapticFeedbackTypes> = {
  selection: 'selection',
  impactLight: 'impactLight',
  impactMedium: 'impactMedium',
  impactHeavy: 'impactHeavy',
  success: 'notificationSuccess',
  warning: 'notificationWarning',
  error: 'notificationError',
};

export function useHaptics() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    let mounted = true;

    const syncReduceMotion = async () => {
      try {
        const reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        if (mounted) {
          setEnabled(!reduceMotionEnabled);
        }
      } catch (error) {
        logger.debug('Unable to read reduce-motion setting', error);
      }
    };

    syncReduceMotion();

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      setEnabled(!value);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const trigger = useCallback(
    (intent: HapticIntent) => {
      if (!enabled) {
        return;
      }
      try {
        HapticFeedback.trigger(INTENT_TO_TYPE[intent], DEFAULT_OPTIONS);
      } catch (error) {
        logger.debug('Haptic trigger failed', error);
      }
    },
    [enabled],
  );

  const custom = useCallback(
    (type: HapticFeedbackTypes) => {
      if (!enabled) {
        return;
      }
      try {
        HapticFeedback.trigger(type, DEFAULT_OPTIONS);
      } catch (error) {
        logger.debug('Haptic trigger failed', error);
      }
    },
    [enabled],
  );

  return {
    enabled,
    selection: () => trigger('selection'),
    impactLight: () => trigger('impactLight'),
    impactMedium: () => trigger('impactMedium'),
    impactHeavy: () => trigger('impactHeavy'),
    success: () => trigger('success'),
    warning: () => trigger('warning'),
    error: () => trigger('error'),
    custom,
  };
}
