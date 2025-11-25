import { PITCH_RANGES } from '../constants';

// Approximate RGB values matching DesignTokens
const COLORS = {
  BLUE: { r: 36, g: 107, b: 253 }, // #246BFD (Tint)
  RED: { r: 255, g: 59, b: 48 },   // #FF3B30 (Error)
  YELLOW: { r: 255, g: 183, b: 3 }, // #FFB703 (Warmth)
  GRAY: { r: 108, g: 108, b: 112 }, // #6C6C70 (TextSecondary)
} as const;

function interpolateColor(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number },
  factor: number
): string {
  const r = Math.round(color1.r + (color2.r - color1.r) * factor);
  const g = Math.round(color1.g + (color2.g - color1.g) * factor);
  const b = Math.round(color1.b + (color2.b - color1.b) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}

export function pitchToColor(pitchHz: number | null): string {
  if (pitchHz === null || pitchHz < PITCH_RANGES.LOW_MIN || pitchHz > PITCH_RANGES.HIGH_MAX) {
    return `rgb(${COLORS.GRAY.r}, ${COLORS.GRAY.g}, ${COLORS.GRAY.b})`;
  }

  if (pitchHz <= PITCH_RANGES.LOW_MAX) {
    return `rgb(${COLORS.BLUE.r}, ${COLORS.BLUE.g}, ${COLORS.BLUE.b})`;
  }

  if (pitchHz <= PITCH_RANGES.MID_MAX) {
    const factor = (pitchHz - PITCH_RANGES.MID_MIN) / (PITCH_RANGES.MID_MAX - PITCH_RANGES.MID_MIN);
    return interpolateColor(COLORS.BLUE, COLORS.RED, factor);
  }

  const factor = (pitchHz - PITCH_RANGES.HIGH_MIN) / (PITCH_RANGES.HIGH_MAX - PITCH_RANGES.HIGH_MIN);
  return interpolateColor(COLORS.RED, COLORS.YELLOW, Math.min(1, factor));
}

export class PitchColorSmoother {
  private history: (number | null)[] = [];
  private readonly windowSize: number;

  constructor(windowSize: number = 3) {
    this.windowSize = windowSize;
  }

  smooth(pitchHz: number | null): number | null {
    this.history.push(pitchHz);
    if (this.history.length > this.windowSize) {
      this.history.shift();
    }

    const validPitches = this.history.filter((p): p is number => p !== null);
    if (validPitches.length === 0) return null;

    return validPitches.reduce((sum, p) => sum + p, 0) / validPitches.length;
  }

  reset(): void {
    this.history = [];
  }
}
