import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReduceTransparency(): boolean {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSetting = async () => {
      try {
        const value = await AccessibilityInfo.isReduceTransparencyEnabled();
        if (mounted) {
          setReduceTransparency(value);
        }
      } catch {
        if (mounted) {
          setReduceTransparency(false);
        }
      }
    };

    checkSetting();

    const listener = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      (value) => setReduceTransparency(value),
    );

    return () => {
      mounted = false;
      listener.remove();
    };
  }, []);

  return reduceTransparency;
}
