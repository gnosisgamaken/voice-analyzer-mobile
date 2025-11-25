import FFT from 'fft-js';

export interface DiagnosticBiomarkers {
  cpp: number | null;
  cppStdDev: number | null;
  jitterLocal: number | null;
  jitterRap: number | null;
  jitterPpq5: number | null;
  shimmerLocal: number | null;
  shimmerApq3: number | null;
  shimmerApq5: number | null;
  hnrDb: number | null;
  nhr: number | null;
  F1: number | null;
  F2: number | null;
  F3: number | null;
  vocalTremor: number | null;
  voiceBreaks: number;
  unvoicedRatio: number;
}

export interface DiagnosticRiskAssessment {
  overallRisk: 'low' | 'moderate' | 'elevated' | 'high';
  confidence: number;
  riskFactors: RiskFactor[];
  recommendations: string[];
}

export interface RiskFactor {
  name: string;
  severity: 'normal' | 'borderline' | 'abnormal';
  value: number;
  normalRange: [number, number];
  clinicalNote?: string;
}

const CLINICAL_THRESHOLDS = {
  jitterLocal: { normal: 0.0104, borderline: 0.02, unit: '%' },
  shimmerLocal: { normal: 0.035, borderline: 0.06, unit: 'dB' },
  hnrDb: { normal: 20, borderline: 12, unit: 'dB' },
  nhr: { normal: 0.19, borderline: 0.35, unit: 'ratio' },
  cpp: { normal: 10, borderline: 6, unit: 'dB' },
};

function safeNumber(value: number, fallback: number = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function computeCepstralPeakProminence(
  audioBuffer: Float32Array,
  sampleRate: number
): { cpp: number | null; cppStdDev: number | null } {
  if (audioBuffer.length < 512) {
    return { cpp: null, cppStdDev: null };
  }

  const frameSize = 1024;
  const hopSize = 256;
  const cppValues: number[] = [];

  for (let start = 0; start + frameSize <= audioBuffer.length; start += hopSize) {
    const frame = new Float32Array(frameSize);
    for (let i = 0; i < frameSize; i++) {
      frame[i] = audioBuffer[start + i];
    }

    const frameCpp = computeFrameCPP(frame, sampleRate);
    if (frameCpp !== null) {
      cppValues.push(frameCpp);
    }
  }

  if (cppValues.length === 0) {
    return { cpp: null, cppStdDev: null };
  }

  const mean = cppValues.reduce((a, b) => a + b, 0) / cppValues.length;
  const variance = cppValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / cppValues.length;
  const stdDev = Math.sqrt(variance);

  return {
    cpp: Number.isFinite(mean) ? mean : null,
    cppStdDev: Number.isFinite(stdDev) ? stdDev : null,
  };
}

function computeFrameCPP(frame: Float32Array, sampleRate: number): number | null {
  const energy = frame.reduce((sum, v) => sum + v * v, 0) / frame.length;
  if (energy < 1e-8) {
    return null;
  }

  const windowed = applyHammingWindow(frame);
  const paddedLength = Math.pow(2, Math.ceil(Math.log2(windowed.length)));
  const padded = new Array(paddedLength).fill(0);
  for (let i = 0; i < windowed.length; i++) {
    padded[i] = windowed[i];
  }

  const spectrum = FFT.fft(padded);
  
  const logMagnitudeComplex: Array<[number, number]> = spectrum.map((c: [number, number]) => {
    const mag = Math.sqrt(c[0] * c[0] + c[1] * c[1]);
    return [Math.log(Math.max(mag, 1e-10)), 0] as [number, number];
  });

  const cepstrum = FFT.ifft(logMagnitudeComplex);
  const realCepstrum = cepstrum.slice(0, cepstrum.length / 2).map((c: [number, number]) => c[0]);

  const minQuefrency = Math.floor(sampleRate / 500);
  const maxQuefrency = Math.floor(sampleRate / 60);
  
  if (maxQuefrency >= realCepstrum.length || minQuefrency >= maxQuefrency) {
    return null;
  }

  let peakValue = -Infinity;
  let peakIndex = minQuefrency;
  for (let i = minQuefrency; i < Math.min(maxQuefrency, realCepstrum.length); i++) {
    if (realCepstrum[i] > peakValue) {
      peakValue = realCepstrum[i];
      peakIndex = i;
    }
  }

  const regressionPoints: Array<{ x: number; y: number }> = [];
  for (let i = minQuefrency; i < Math.min(maxQuefrency, realCepstrum.length); i++) {
    if (Math.abs(i - peakIndex) > 3) {
      regressionPoints.push({ x: i, y: realCepstrum[i] });
    }
  }

  if (regressionPoints.length < 5) {
    return null;
  }

  const n = regressionPoints.length;
  const sumX = regressionPoints.reduce((sum, p) => sum + p.x, 0);
  const sumY = regressionPoints.reduce((sum, p) => sum + p.y, 0);
  const sumXY = regressionPoints.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumX2 = regressionPoints.reduce((sum, p) => sum + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const baselineAtPeak = slope * peakIndex + intercept;

  const cpp = peakValue - baselineAtPeak;
  return Number.isFinite(cpp) ? cpp : null;
}

function applyHammingWindow(buffer: Float32Array): Float32Array {
  const windowed = new Float32Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    const multiplier = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (buffer.length - 1));
    windowed[i] = buffer[i] * multiplier;
  }
  return windowed;
}

export function computeEnhancedJitter(pitchPeriods: number[]): {
  jitterLocal: number | null;
  jitterRap: number | null;
  jitterPpq5: number | null;
} {
  if (pitchPeriods.length < 5) {
    return { jitterLocal: null, jitterRap: null, jitterPpq5: null };
  }

  const validPeriods = pitchPeriods.filter(p => p > 0 && Number.isFinite(p));
  if (validPeriods.length < 5) {
    return { jitterLocal: null, jitterRap: null, jitterPpq5: null };
  }

  const avgPeriod = validPeriods.reduce((a, b) => a + b, 0) / validPeriods.length;
  if (avgPeriod === 0) {
    return { jitterLocal: null, jitterRap: null, jitterPpq5: null };
  }

  let sumAbsDiff = 0;
  for (let i = 1; i < validPeriods.length; i++) {
    sumAbsDiff += Math.abs(validPeriods[i] - validPeriods[i - 1]);
  }
  const jitterLocal = sumAbsDiff / ((validPeriods.length - 1) * avgPeriod);

  let rapSum = 0;
  for (let i = 1; i < validPeriods.length - 1; i++) {
    const avg3 = (validPeriods[i - 1] + validPeriods[i] + validPeriods[i + 1]) / 3;
    rapSum += Math.abs(validPeriods[i] - avg3);
  }
  const jitterRap = rapSum / ((validPeriods.length - 2) * avgPeriod);

  let ppq5Sum = 0;
  for (let i = 2; i < validPeriods.length - 2; i++) {
    const avg5 = (
      validPeriods[i - 2] + validPeriods[i - 1] + validPeriods[i] +
      validPeriods[i + 1] + validPeriods[i + 2]
    ) / 5;
    ppq5Sum += Math.abs(validPeriods[i] - avg5);
  }
  const jitterPpq5 = validPeriods.length >= 5 
    ? ppq5Sum / ((validPeriods.length - 4) * avgPeriod) 
    : null;

  return {
    jitterLocal: Number.isFinite(jitterLocal) ? jitterLocal : null,
    jitterRap: Number.isFinite(jitterRap) ? jitterRap : null,
    jitterPpq5: jitterPpq5 !== null && Number.isFinite(jitterPpq5) ? jitterPpq5 : null,
  };
}

export function computeEnhancedShimmer(amplitudes: number[]): {
  shimmerLocal: number | null;
  shimmerApq3: number | null;
  shimmerApq5: number | null;
} {
  if (amplitudes.length < 5) {
    return { shimmerLocal: null, shimmerApq3: null, shimmerApq5: null };
  }

  const validAmps = amplitudes.filter(a => a > 0 && Number.isFinite(a));
  if (validAmps.length < 5) {
    return { shimmerLocal: null, shimmerApq3: null, shimmerApq5: null };
  }

  const avgAmp = validAmps.reduce((a, b) => a + b, 0) / validAmps.length;
  if (avgAmp === 0) {
    return { shimmerLocal: null, shimmerApq3: null, shimmerApq5: null };
  }

  let sumAbsDiff = 0;
  for (let i = 1; i < validAmps.length; i++) {
    sumAbsDiff += Math.abs(validAmps[i] - validAmps[i - 1]);
  }
  const shimmerLocal = sumAbsDiff / ((validAmps.length - 1) * avgAmp);

  let apq3Sum = 0;
  for (let i = 1; i < validAmps.length - 1; i++) {
    const avg3 = (validAmps[i - 1] + validAmps[i] + validAmps[i + 1]) / 3;
    apq3Sum += Math.abs(validAmps[i] - avg3);
  }
  const shimmerApq3 = apq3Sum / ((validAmps.length - 2) * avgAmp);

  let apq5Sum = 0;
  for (let i = 2; i < validAmps.length - 2; i++) {
    const avg5 = (
      validAmps[i - 2] + validAmps[i - 1] + validAmps[i] +
      validAmps[i + 1] + validAmps[i + 2]
    ) / 5;
    apq5Sum += Math.abs(validAmps[i] - avg5);
  }
  const shimmerApq5 = validAmps.length >= 5 
    ? apq5Sum / ((validAmps.length - 4) * avgAmp) 
    : null;

  return {
    shimmerLocal: Number.isFinite(shimmerLocal) ? shimmerLocal : null,
    shimmerApq3: Number.isFinite(shimmerApq3) ? shimmerApq3 : null,
    shimmerApq5: shimmerApq5 !== null && Number.isFinite(shimmerApq5) ? shimmerApq5 : null,
  };
}

export function computeHNR(audioBuffer: Float32Array, sampleRate: number): {
  hnrDb: number | null;
  nhr: number | null;
} {
  if (audioBuffer.length < 256) {
    return { hnrDb: null, nhr: null };
  }

  const mean = audioBuffer.reduce((a, b) => a + b, 0) / audioBuffer.length;
  const centered = new Float32Array(audioBuffer.length);
  for (let i = 0; i < audioBuffer.length; i++) {
    centered[i] = audioBuffer[i] - mean;
  }

  const maxLag = Math.floor(sampleRate / 75);
  const minLag = Math.floor(sampleRate / 500);
  
  let maxCorr = 0;
  let peakLag = 0;
  const autocorr0 = centered.reduce((sum, v) => sum + v * v, 0);

  for (let lag = minLag; lag <= Math.min(maxLag, centered.length / 2); lag++) {
    let corr = 0;
    for (let i = 0; i < centered.length - lag; i++) {
      corr += centered[i] * centered[i + lag];
    }
    if (corr > maxCorr) {
      maxCorr = corr;
      peakLag = lag;
    }
  }

  if (autocorr0 === 0 || maxCorr === 0) {
    return { hnrDb: null, nhr: null };
  }

  const normalizedPeak = maxCorr / autocorr0;
  const harmonicPower = normalizedPeak * autocorr0;
  const noisePower = Math.max(autocorr0 - harmonicPower, 1e-10);
  
  const hnrLinear = harmonicPower / noisePower;
  const hnrDb = 10 * Math.log10(Math.max(hnrLinear, 1e-10));
  const nhr = 1 / Math.max(hnrLinear, 1e-10);

  return {
    hnrDb: Number.isFinite(hnrDb) ? clamp(hnrDb, -20, 40) : null,
    nhr: Number.isFinite(nhr) ? clamp(nhr, 0, 1) : null,
  };
}

export function extractFormants(
  audioBuffer: Float32Array,
  sampleRate: number,
  lpcOrder: number = 12
): { F1: number | null; F2: number | null; F3: number | null } {
  if (audioBuffer.length < lpcOrder * 2) {
    return { F1: null, F2: null, F3: null };
  }

  const energy = audioBuffer.reduce((sum, v) => sum + v * v, 0) / audioBuffer.length;
  if (energy < 1e-8) {
    return { F1: null, F2: null, F3: null };
  }

  const preEmphasis = 0.97;
  const emphasized = new Float32Array(audioBuffer.length);
  emphasized[0] = audioBuffer[0];
  for (let i = 1; i < audioBuffer.length; i++) {
    emphasized[i] = audioBuffer[i] - preEmphasis * audioBuffer[i - 1];
  }

  const windowed = applyHammingWindow(emphasized);
  const lpcResult = computeLPCCoefficients(windowed, lpcOrder);
  
  if (!lpcResult || !lpcResult.stable) {
    return { F1: null, F2: null, F3: null };
  }

  const roots = findPolynomialRoots(lpcResult.coeffs);
  const formants = roots
    .filter(root => root.imag > 0)
    .map(root => {
      const magnitude = Math.sqrt(root.real * root.real + root.imag * root.imag);
      if (magnitude >= 1 || magnitude < 0.5) {
        return null;
      }
      const freq = Math.atan2(root.imag, root.real) * sampleRate / (2 * Math.PI);
      const bandwidth = -Math.log(magnitude) * sampleRate / Math.PI;
      if (freq < 0 || !Number.isFinite(freq) || !Number.isFinite(bandwidth)) {
        return null;
      }
      return { freq, bandwidth };
    })
    .filter((f): f is { freq: number; bandwidth: number } => 
      f !== null && f.freq > 90 && f.freq < 5500 && f.bandwidth > 30 && f.bandwidth < 600
    )
    .sort((a, b) => a.freq - b.freq);

  const F1 = formants.find(f => f.freq >= 200 && f.freq <= 1000)?.freq ?? null;
  const F2 = formants.find(f => f.freq > 800 && f.freq <= 2800)?.freq ?? null;
  const F3 = formants.find(f => f.freq > 2000 && f.freq <= 4000)?.freq ?? null;

  return { F1, F2, F3 };
}

interface LPCResult {
  coeffs: number[];
  stable: boolean;
}

function computeLPCCoefficients(signal: Float32Array, order: number): LPCResult | null {
  const r = new Float32Array(order + 1);
  for (let i = 0; i <= order; i++) {
    for (let n = 0; n < signal.length - i; n++) {
      r[i] += signal[n] * signal[n + i];
    }
  }

  if (r[0] === 0) {
    return null;
  }

  const a = new Float32Array(order + 1);
  const aTemp = new Float32Array(order + 1);
  const reflectionCoeffs: number[] = [];
  a[0] = 1;
  
  let e = r[0];
  let stable = true;
  
  for (let i = 1; i <= order; i++) {
    let lambda = 0;
    for (let j = 0; j < i; j++) {
      lambda -= a[j] * r[i - j];
    }
    lambda /= e;
    
    reflectionCoeffs.push(lambda);
    if (Math.abs(lambda) >= 1.0) {
      stable = false;
    }
    
    for (let j = 0; j <= i; j++) {
      aTemp[j] = a[j] + lambda * a[i - j];
    }
    for (let j = 0; j <= i; j++) {
      a[j] = aTemp[j];
    }
    
    e *= (1 - lambda * lambda);
    if (e <= 0) {
      return null;
    }
  }

  return { 
    coeffs: Array.from(a),
    stable
  };
}

interface ComplexNumber {
  real: number;
  imag: number;
}

function findPolynomialRoots(coeffs: number[]): ComplexNumber[] {
  const n = coeffs.length - 1;
  if (n < 1) return [];

  const roots: ComplexNumber[] = [];
  
  for (let k = 0; k < n; k++) {
    const angle = (2 * Math.PI * k) / n + 0.1;
    const magnitude = 0.9;
    roots.push({
      real: magnitude * Math.cos(angle),
      imag: magnitude * Math.sin(angle),
    });
  }

  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let iter = 0; iter < maxIterations; iter++) {
    let maxDelta = 0;
    
    for (let i = 0; i < n; i++) {
      const z = roots[i];
      const pz = evaluatePolynomial(coeffs, z);
      
      let denom = { real: 1, imag: 0 };
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const diff = complexSubtract(z, roots[j]);
          denom = complexMultiply(denom, diff);
        }
      }
      
      if (Math.abs(denom.real) < 1e-10 && Math.abs(denom.imag) < 1e-10) {
        continue;
      }
      
      const delta = complexDivide(pz, denom);
      roots[i] = complexSubtract(z, delta);
      
      const deltaMag = Math.sqrt(delta.real * delta.real + delta.imag * delta.imag);
      maxDelta = Math.max(maxDelta, deltaMag);
    }
    
    if (maxDelta < tolerance) {
      break;
    }
  }

  return roots;
}

function evaluatePolynomial(coeffs: number[], z: ComplexNumber): ComplexNumber {
  let result = { real: coeffs[0], imag: 0 };
  let zPower = { real: 1, imag: 0 };
  
  for (let i = 1; i < coeffs.length; i++) {
    zPower = complexMultiply(zPower, z);
    result.real += coeffs[i] * zPower.real;
    result.imag += coeffs[i] * zPower.imag;
  }
  
  return result;
}

function complexMultiply(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return {
    real: a.real * b.real - a.imag * b.imag,
    imag: a.real * b.imag + a.imag * b.real,
  };
}

function complexSubtract(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return {
    real: a.real - b.real,
    imag: a.imag - b.imag,
  };
}

function complexDivide(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  const denom = b.real * b.real + b.imag * b.imag;
  if (denom === 0) {
    return { real: 0, imag: 0 };
  }
  return {
    real: (a.real * b.real + a.imag * b.imag) / denom,
    imag: (a.imag * b.real - a.real * b.imag) / denom,
  };
}

export function detectVocalTremor(
  pitchHistory: number[],
  sampleIntervalMs: number
): { tremorRate: number | null; tremorDepth: number | null } {
  const validPitches = pitchHistory.filter(p => p > 0 && Number.isFinite(p));
  if (validPitches.length < 20) {
    return { tremorRate: null, tremorDepth: null };
  }

  const mean = validPitches.reduce((a, b) => a + b, 0) / validPitches.length;
  const detrended = validPitches.map(p => p - mean);

  const sampleRateHz = 1000 / sampleIntervalMs;
  const minTremorFreq = 3;
  const maxTremorFreq = 12;
  
  let maxPower = 0;
  let tremorFreq = 0;

  for (let freq = minTremorFreq; freq <= maxTremorFreq; freq += 0.5) {
    const omega = 2 * Math.PI * freq / sampleRateHz;
    let realSum = 0;
    let imagSum = 0;
    
    for (let i = 0; i < detrended.length; i++) {
      realSum += detrended[i] * Math.cos(omega * i);
      imagSum += detrended[i] * Math.sin(omega * i);
    }
    
    const power = realSum * realSum + imagSum * imagSum;
    if (power > maxPower) {
      maxPower = power;
      tremorFreq = freq;
    }
  }

  const variance = detrended.reduce((sum, v) => sum + v * v, 0) / detrended.length;
  const tremorDepth = Math.sqrt(maxPower / detrended.length) / Math.max(mean, 1);

  if (tremorDepth < 0.01) {
    return { tremorRate: null, tremorDepth: null };
  }

  return {
    tremorRate: tremorFreq,
    tremorDepth: clamp(tremorDepth, 0, 1),
  };
}

export function detectVoiceBreaks(
  pitchHistory: number[],
  energyHistory: number[]
): { breakCount: number; unvoicedRatio: number } {
  let breakCount = 0;
  let unvoicedFrames = 0;
  let wasVoiced = false;

  for (let i = 0; i < pitchHistory.length; i++) {
    const isVoiced = pitchHistory[i] > 0 && energyHistory[i] > 0.01;
    
    if (wasVoiced && !isVoiced && energyHistory[i] > 0.02) {
      breakCount++;
    }
    
    if (!isVoiced) {
      unvoicedFrames++;
    }
    
    wasVoiced = isVoiced;
  }

  const unvoicedRatio = pitchHistory.length > 0 
    ? unvoicedFrames / pitchHistory.length 
    : 0;

  return { breakCount, unvoicedRatio };
}

export function computeFullDiagnostics(
  audioBuffer: Float32Array,
  sampleRate: number,
  pitchHistory: number[],
  amplitudeHistory: number[],
  energyHistory: number[],
  sampleIntervalMs: number
): DiagnosticBiomarkers {
  const { cpp, cppStdDev } = computeCepstralPeakProminence(audioBuffer, sampleRate);
  
  const pitchPeriods = pitchHistory
    .filter(hz => hz > 0)
    .map(hz => 1 / hz);
  const { jitterLocal, jitterRap, jitterPpq5 } = computeEnhancedJitter(pitchPeriods);
  
  const { shimmerLocal, shimmerApq3, shimmerApq5 } = computeEnhancedShimmer(amplitudeHistory);
  
  const { hnrDb, nhr } = computeHNR(audioBuffer, sampleRate);
  
  const { F1, F2, F3 } = extractFormants(audioBuffer, sampleRate);
  
  const { tremorRate, tremorDepth } = detectVocalTremor(pitchHistory, sampleIntervalMs);
  
  const { breakCount, unvoicedRatio } = detectVoiceBreaks(pitchHistory, energyHistory);

  return {
    cpp,
    cppStdDev,
    jitterLocal,
    jitterRap,
    jitterPpq5,
    shimmerLocal,
    shimmerApq3,
    shimmerApq5,
    hnrDb,
    nhr,
    F1,
    F2,
    F3,
    vocalTremor: tremorDepth,
    voiceBreaks: breakCount,
    unvoicedRatio,
  };
}

export function assessDiagnosticRisk(biomarkers: DiagnosticBiomarkers): DiagnosticRiskAssessment {
  const riskFactors: RiskFactor[] = [];
  
  if (biomarkers.jitterLocal !== null) {
    const severity = biomarkers.jitterLocal <= CLINICAL_THRESHOLDS.jitterLocal.normal
      ? 'normal'
      : biomarkers.jitterLocal <= CLINICAL_THRESHOLDS.jitterLocal.borderline
        ? 'borderline'
        : 'abnormal';
    riskFactors.push({
      name: 'Pitch Perturbation (Jitter)',
      severity,
      value: biomarkers.jitterLocal * 100,
      normalRange: [0, CLINICAL_THRESHOLDS.jitterLocal.normal * 100],
      clinicalNote: severity === 'abnormal' 
        ? 'Elevated jitter may indicate vocal fold irregularity or neurological factors'
        : undefined,
    });
  }

  if (biomarkers.shimmerLocal !== null) {
    const severity = biomarkers.shimmerLocal <= CLINICAL_THRESHOLDS.shimmerLocal.normal
      ? 'normal'
      : biomarkers.shimmerLocal <= CLINICAL_THRESHOLDS.shimmerLocal.borderline
        ? 'borderline'
        : 'abnormal';
    riskFactors.push({
      name: 'Amplitude Perturbation (Shimmer)',
      severity,
      value: biomarkers.shimmerLocal * 100,
      normalRange: [0, CLINICAL_THRESHOLDS.shimmerLocal.normal * 100],
      clinicalNote: severity === 'abnormal'
        ? 'Elevated shimmer may suggest incomplete vocal fold closure or fatigue'
        : undefined,
    });
  }

  if (biomarkers.hnrDb !== null) {
    const severity = biomarkers.hnrDb >= CLINICAL_THRESHOLDS.hnrDb.normal
      ? 'normal'
      : biomarkers.hnrDb >= CLINICAL_THRESHOLDS.hnrDb.borderline
        ? 'borderline'
        : 'abnormal';
    riskFactors.push({
      name: 'Harmonic-to-Noise Ratio',
      severity,
      value: biomarkers.hnrDb,
      normalRange: [CLINICAL_THRESHOLDS.hnrDb.normal, 40],
      clinicalNote: severity === 'abnormal'
        ? 'Low HNR indicates breathiness or turbulent airflow in phonation'
        : undefined,
    });
  }

  if (biomarkers.cpp !== null) {
    const severity = biomarkers.cpp >= CLINICAL_THRESHOLDS.cpp.normal
      ? 'normal'
      : biomarkers.cpp >= CLINICAL_THRESHOLDS.cpp.borderline
        ? 'borderline'
        : 'abnormal';
    riskFactors.push({
      name: 'Cepstral Peak Prominence',
      severity,
      value: biomarkers.cpp,
      normalRange: [CLINICAL_THRESHOLDS.cpp.normal, 25],
      clinicalNote: severity === 'abnormal'
        ? 'Low CPP is a strong indicator of dysphonia severity'
        : undefined,
    });
  }

  if (biomarkers.vocalTremor !== null && biomarkers.vocalTremor > 0.05) {
    riskFactors.push({
      name: 'Vocal Tremor',
      severity: biomarkers.vocalTremor > 0.15 ? 'abnormal' : 'borderline',
      value: biomarkers.vocalTremor * 100,
      normalRange: [0, 5],
      clinicalNote: 'Rhythmic pitch modulation detected; may indicate essential tremor or tension',
    });
  }

  if (biomarkers.voiceBreaks > 2) {
    riskFactors.push({
      name: 'Voice Breaks',
      severity: biomarkers.voiceBreaks > 5 ? 'abnormal' : 'borderline',
      value: biomarkers.voiceBreaks,
      normalRange: [0, 2],
      clinicalNote: 'Frequent voice breaks may indicate strain or phonatory instability',
    });
  }

  const abnormalCount = riskFactors.filter(f => f.severity === 'abnormal').length;
  const borderlineCount = riskFactors.filter(f => f.severity === 'borderline').length;
  
  let overallRisk: DiagnosticRiskAssessment['overallRisk'];
  if (abnormalCount >= 3) {
    overallRisk = 'high';
  } else if (abnormalCount >= 1) {
    overallRisk = 'elevated';
  } else if (borderlineCount >= 2) {
    overallRisk = 'moderate';
  } else {
    overallRisk = 'low';
  }

  const measuredFactors = riskFactors.length;
  const confidence = measuredFactors >= 4 ? 0.9 : measuredFactors >= 2 ? 0.7 : 0.5;

  const recommendations: string[] = [];
  if (overallRisk === 'high') {
    recommendations.push('Consider scheduling an evaluation with a speech-language pathologist');
    recommendations.push('Avoid vocal strain and maintain good hydration');
  } else if (overallRisk === 'elevated') {
    recommendations.push('Monitor your voice quality over the next few days');
    recommendations.push('Practice vocal rest periods between heavy use');
  } else if (overallRisk === 'moderate') {
    recommendations.push('Your voice shows some variability - track patterns over time');
  }

  return {
    overallRisk,
    confidence,
    riskFactors,
    recommendations,
  };
}
