import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * A hook that returns whether the user has enabled the "Reduce Transparency"
 * accessibility setting.
 *
 * @returns {boolean} `true` if Reduce Transparency is enabled, `false` otherwise.
 */
export const useReduceTransparency = (): boolean => {
  const [reduceTransparencyEnabled, setReduceTransparencyEnabled] =
    useState(false);

  useEffect(() => {
    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      (isEnabled) => {
        setReduceTransparencyEnabled(isEnabled);
      }
    );

    AccessibilityInfo.isReduceTransparencyEnabled().then((isEnabled) => {
      setReduceTransparencyEnabled(isEnabled);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return reduceTransparencyEnabled;
};
