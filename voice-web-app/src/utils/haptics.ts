export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

const VIBRATION_PATTERNS: Record<HapticFeedbackType, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  selection: 5,
  success: [10, 50, 10],
  warning: [20, 100, 20],
  error: [30, 100, 30, 100, 30],
};

export function triggerHaptic(type: HapticFeedbackType = 'light'): void {
  if (!navigator.vibrate) return;

  const pattern = VIBRATION_PATTERNS[type];
  navigator.vibrate(pattern);
}

export function canUseHaptics(): boolean {
  return 'vibrate' in navigator;
}
