import { PlatformColor } from 'react-native';

/**
 * Centralized design tokens for the application
 */

const fallbackColor = (hex: string) => hex;

export const COLORS = {
  background: PlatformColor?.('systemBackground') ?? fallbackColor('#F2F2F7'),
  secondaryBackground: PlatformColor?.('secondarySystemBackground') ?? fallbackColor('#FFFFFF'),
  separator: PlatformColor?.('separator') ?? fallbackColor('rgba(60,60,67,0.36)'),
  label: PlatformColor?.('label') ?? fallbackColor('#000000'),
  secondaryLabel: PlatformColor?.('secondaryLabel') ?? fallbackColor('#8E8E93'),
  tertiaryLabel: PlatformColor?.('tertiaryLabel') ?? fallbackColor('#C7C7CC'),
  primary: '#246BFD',
  primaryMuted: 'rgba(36,107,253,0.15)',
  success: PlatformColor?.('systemGreen') ?? fallbackColor('#34C759'),
  warning: PlatformColor?.('systemOrange') ?? fallbackColor('#FF9500'),
  critical: PlatformColor?.('systemRed') ?? fallbackColor('#FF3B30'),
  surface: 'rgba(255,255,255,0.82)',
  surfaceDark: 'rgba(27,27,31,0.74)',
  pitchLow: 'rgb(59, 130, 246)',
  pitchMid: 'rgb(255, 48, 59)',
  pitchHigh: 'rgb(255, 204, 0)',
  pitchGray: 'rgb(156, 163, 175)',
} as const;

export const TYPOGRAPHY = {
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700' as const,
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
  },
  caption2: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADII = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const AUDIO_CONFIG = {
  sampleRate: 44100,
  fftSize: 2048,
  analysisInterval: 50, // milliseconds
  pitchRange: {
    min: 50,
    max: 500,
  },
  waveformWindowSize: 100,
  waveformBarGap: 2,
} as const;

export const PITCH_RANGES = {
  LOW_MIN: 85,
  LOW_MAX: 180,
  MID_MIN: 180,
  MID_MAX: 255,
  HIGH_MIN: 255,
  HIGH_MAX: 400,
} as const;
