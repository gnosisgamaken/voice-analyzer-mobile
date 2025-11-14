const PITCH_RANGES = {
  LOW_MIN: 85,
  LOW_MAX: 180,
  MID_MIN: 180,
  MID_MAX: 255,
  HIGH_MIN: 255,
  HIGH_MAX: 400,
} as const;

const COLORS = {
  BLUE: { r: 59, g: 130, b: 246 },
  RED: { r: 255, g: 48, b: 59 },
  YELLOW: { r: 255, g: 204, b: 0 },
  GRAY: { r: 156, g: 163, b: 175 },
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
