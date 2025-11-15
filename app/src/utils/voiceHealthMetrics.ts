export interface VoiceHealthInputs {
  pitchHzHistory: number[];
  amplitudeHistory: number[];
}

export interface VoiceHealthMetrics {
  jitter: number | null;
  shimmer: number | null;
  hnr: number | null;
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function analyzeVoiceHealth(inputs: VoiceHealthInputs): VoiceHealthMetrics {
  const periods = inputs.pitchHzHistory
    .filter((hz) => hz && hz > 0)
    .map((hz) => 1 / hz);
  const amplitudes = inputs.amplitudeHistory;

  const jitter = calculateJitter(periods);
  const shimmer = calculateShimmer(amplitudes);
  const hnr = estimateHNRFromAmplitude(amplitudes);

  return {
    jitter,
    shimmer,
    hnr,
  };
}

export function calculateJitter(pitchPeriods: number[]): number | null {
  if (pitchPeriods.length < 2) {
    return null;
  }
  let totalDiff = 0;
  for (let i = 1; i < pitchPeriods.length; i++) {
    totalDiff += Math.abs(pitchPeriods[i] - pitchPeriods[i - 1]);
  }
  const avgDiff = totalDiff / (pitchPeriods.length - 1);
  const avgPeriod = pitchPeriods.reduce((sum, p) => sum + p, 0) / pitchPeriods.length;
  if (avgPeriod === 0) {
    return null;
  }
  return clamp(avgDiff / avgPeriod, 0, 0.2);
}

export function calculateShimmer(amplitudes: number[]): number | null {
  if (amplitudes.length < 2) {
    return null;
  }
  let totalDiff = 0;
  for (let i = 1; i < amplitudes.length; i++) {
    totalDiff += Math.abs(amplitudes[i] - amplitudes[i - 1]);
  }
  const avgDiff = totalDiff / (amplitudes.length - 1);
  const avgAmp = amplitudes.reduce((sum, a) => sum + a, 0) / amplitudes.length;
  if (avgAmp === 0) {
    return null;
  }
  return clamp(avgDiff / avgAmp, 0, 0.3);
}

function estimateHNRFromAmplitude(amplitudes: number[]): number | null {
  if (amplitudes.length < 2) {
    return null;
  }
  const mean = amplitudes.reduce((sum, a) => sum + a, 0) / amplitudes.length;
  const variance = amplitudes.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amplitudes.length;
  if (variance === 0) {
    return null;
  }
  // Rough proxy: higher variance -> lower HNR
  const normalizedVariance = clamp(variance / (mean || 1));
  const hnrDb = (1 - normalizedVariance) * 20; // 0-20 dB range
  return Number.isFinite(hnrDb) ? hnrDb : null;
}
