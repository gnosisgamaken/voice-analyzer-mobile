import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * A hook that returns whether the user has enabled the "Reduce Motion"
 * accessibility setting.
 *
 * @returns {boolean} `true` if Reduce Motion is enabled, `false` otherwise.
 */
export const useReduceMotion = (): boolean => {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isEnabled) => {
        setReduceMotionEnabled(isEnabled);
      }
    );

    AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
      setReduceMotionEnabled(isEnabled);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return reduceMotionEnabled;
};
