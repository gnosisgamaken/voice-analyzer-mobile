// Legacy constants removed. Use DesignTokens from '../design/tokens' instead.

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
