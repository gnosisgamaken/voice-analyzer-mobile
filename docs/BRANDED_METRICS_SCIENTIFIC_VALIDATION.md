# Branded Metrics: Scientific Validation & Implementation Spec

This document provides the research-backed formulas and JavaScript/TypeScript implementations for the Voice Analyzer's six branded metrics and the Voice IQ™ composite score. This serves as the engineering source of truth for the scientific model.

## 1. Core Acoustic Features (Implementations)

These are the fundamental features to be extracted from a voiced audio segment. They are the building blocks for the branded metrics.

### 1.1. Jitter (Relative Average Perturbation - RAP)

Measures the cycle-to-cycle variability in fundamental frequency.

**Source:** Based on standard perturbation metrics in voice science. (e.g., "Clinical Measurement of Voice and Speech, Second Edition" by R.J. Baken and R.F. Orlikoff).

**Implementation (TypeScript):**
```typescript
/**
 * Computes Jitter (RAP - Relative Average Perturbation).
 * @param periods An array of consecutive fundamental period lengths in samples.
 * @returns Jitter as a percentage. Healthy voices are typically < 1%.
 */
function computeJitter(periods: number[]): number {
  const N = periods.length;
  if (N < 4) return 0; // Need at least 4 periods for a 3-period window average

  let sumOfDifferences = 0;
  // RAP compares each period to the average of it and its neighbors (3-period window)
  for (let i = 1; i < N - 1; i++) {
    const localAveragePeriod = (periods[i - 1] + periods[i] + periods[i + 1]) / 3;
    sumOfDifferences += Math.abs(periods[i] - localAveragePeriod);
  }

  const averagePeriod = periods.reduce((a, b) => a + b, 0) / N;
  if (averagePeriod === 0) return 0;

  const rap = (sumOfDifferences / (N - 2)) / averagePeriod;
  return rap * 100;
}
```

### 1.2. Shimmer (Amplitude Perturbation Quotient - APQ)

Measures the cycle-to-cycle variability in amplitude.

**Source:** Standard perturbation metric, analogous to Jitter but for amplitude.

**Implementation (TypeScript):**
```typescript
/**
 * Computes Shimmer (APQ - Amplitude Perturbation Quotient) over a 3-point window.
 * @param amplitudes An array of peak amplitudes for each fundamental period.
 * @returns Shimmer as a percentage.
 */
function computeShimmer(amplitudes: number[]): number {
  const N = amplitudes.length;
  if (N < 4) return 0;

  let sumOfDifferences = 0;
  for (let i = 1; i < N - 1; i++) {
    const localAverageAmplitude = (amplitudes[i - 1] + amplitudes[i] + amplitudes[i + 1]) / 3;
    sumOfDifferences += Math.abs(amplitudes[i] - localAverageAmplitude);
  }

  const averageAmplitude = amplitudes.reduce((a, b) => a + b, 0) / N;
  if (averageAmplitude === 0) return 0;
  
  const apq = (sumOfDifferences / (N - 2)) / averageAmplitude;
  return apq * 100;
}
```

### 1.3. Harmonic-to-Noise Ratio (HNR)

Measures the ratio of periodic (harmonic) energy to aperiodic (noise) energy.

**Source:** Based on the time-domain autocorrelation method. (e.g., as described in voice analysis literature).

**Implementation (TypeScript):**
```typescript
/**
 * Computes Harmonic-to-Noise Ratio (HNR) from an audio segment using autocorrelation.
 * @param samples A Float32Array of a voiced audio segment.
 * @param fundamentalPeriod The fundamental period in samples, derived from a pitch detector.
 * @returns HNR in decibels (dB). Healthy voices are often > 15-20 dB.
 */
function computeHNR(samples: Float32Array, fundamentalPeriod: number): number {
  const N = samples.length;
  const tau = Math.round(fundamentalPeriod);

  if (tau < 1 || tau >= N) {
    return 0; // Invalid period
  }

  // R(0) - Autocorrelation at lag 0 (total signal energy)
  let r0 = 0;
  for (let i = 0; i < N; i++) {
    r0 += samples[i] * samples[i];
  }

  // R(tau) - Autocorrelation at lag tau (harmonic energy)
  let rTau = 0;
  for (let i = 0; i < N - tau; i++) {
    rTau += samples[i] * samples[i + tau];
  }

  const harmonicPower = rTau;
  const noisePower = r0 - rTau;

  if (noisePower <= 0 || harmonicPower <= 0) {
    return 0; // Avoid log of non-positive, indicates perfectly periodic or error
  }

  const hnr = 10 * Math.log10(harmonicPower / noisePower);
  return hnr > 0 ? hnr : 0; // Return HNR, ensuring it's not negative.
}
```

### 1.4. Fundamental Frequency (Pitch) using AMDF

A robust pitch detection algorithm using Average Magnitude Difference Function (AMDF), which is efficient for mobile implementation.

**Source:** Based on standard pitch detection algorithms suitable for real-time processing.

**Implementation (TypeScript):**
```typescript
/**
 * Estimates the fundamental frequency (pitch) of an audio frame using AMDF.
 * @param samples A Float32Array of PCM data.
 * @param sampleRate The sample rate of the audio.
 * @returns The estimated fundamental frequency in Hz.
 */
function estimatePitch(samples: Float32Array, sampleRate: number): number {
  const N = samples.length;
  const minFreq = 50; // Min typical human voice pitch
  const maxFreq = 500; // Max typical human voice pitch

  const minLag = Math.floor(sampleRate / maxFreq);
  const maxLag = Math.floor(sampleRate / minFreq);

  let bestLag = 0;
  let minValue = Infinity;

  // AMDF: Find the lag with the minimum average magnitude difference
  for (let tau = minLag; tau <= maxLag; tau++) {
    let sumDiff = 0;
    for (let i = 0; i < N - tau; i++) {
      sumDiff += Math.abs(samples[i] - samples[i + tau]);
    }
    const avgDiff = sumDiff / (N - tau);
    
    if (avgDiff < minValue) {
      minValue = avgDiff;
      bestLag = tau;
    }
  }

  if (bestLag === 0) return 0;

  // Refinement: Could add parabolic interpolation here to get sub-sample accuracy.
  const fundamentalFreq = sampleRate / bestLag;
  return fundamentalFreq;
}
```

## 2. Branded Metric Formulas

The following functions define how the core acoustic features are combined into the user-facing branded metrics.

```typescript
interface CoreAcousticFeatures {
  jitter: number;          // In percent
  shimmer: number;         // In percent
  hnr: number;             // In dB
  spectralCentroid: number;// In Hz
  rmsEnergy: number;       // Normalized [0, 1]
  pitchContour: number[];  // Array of F0 values in Hz
  volumeContour: number[]; // Array of RMS values
}

// Placeholder for normalization functions that map raw values to a 0-100 scale.
const normalize = (value: number, min: number, max: number) => {
    return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}
```

### 2.1. Clarity

Based on the **Spectral Centroid**. A higher centroid indicates more high-frequency energy and a "brighter" or "clearer" sound.

**Formula:**
`Clarity = normalize(spectralCentroid, 500, 4000)` (Example normalization range for voice)

### 2.2. Power

Based on **RMS Energy**. A-weighting could be added for perceptual accuracy, but raw energy is a solid proxy.

**Formula:**
`Power = normalize(20 * log10(rmsEnergy), -60, -5)` (Example normalization for dBFS)

### 2.3. Vocal Health

A composite of **Jitter**, **Shimmer**, and **HNR**. Healthy voices have low perturbation (jitter/shimmer) and a high harmonic-to-noise ratio.

**Formula:**
`Health = ( (100 - normalize(jitter, 0, 2)) + (100 - normalize(shimmer, 0, 5)) + normalize(hnr, 0, 30) ) / 3`
(Inverting normalized jitter/shimmer scores, where higher is worse).

### 2.4. Warmth

Based on the **Bass-to-Treble Ratio**. A "warm" voice has more energy in lower frequencies.

**Formula:**
- Calculate `lowFreqEnergy` = Energy in 0-500 Hz band.
- Calculate `highFreqEnergy` = Energy in 2kHz-8kHz band.
- `Warmth = normalize(lowFreqEnergy / highFreqEnergy, 0.5, 5)` (Example normalization)

### 2.5. Confidence

Based on **Pitch Stability**. A confident voice is steady. We use low jitter as the primary proxy.

**Formula:**
`Confidence = 100 - normalize(jitter, 0, 1.5)` (Lower jitter = higher confidence).

### 2.6. Expressiveness

Based on **Pitch Range** (in semitones) and **Volume Dynamic Range**.

**Formula:**
- `pitchRangeST = 12 * log2(max(pitchContour) / min(pitchContour))`
- `volumeRangeDB = 20 * log10(max(volumeContour) / min(volumeContour))`
- `Expressiveness = (normalize(pitchRangeST, 0, 24) + normalize(volumeRangeDB, 0, 30)) / 2`

## 3. Voice IQ™ Composite Score Models

### 3.1. Model B: Health-Focused Composite (Recommended)

This model prioritizes physiological health and stability, aligning with the "vocal health companion" mission.

**Weighting Rationale:**
- **Vocal Health (40%):** The most direct measure of vocal fitness.
- **Confidence (20%):** Stability is a strong indicator of healthy control.
- **Clarity (15%):** A clear signal often correlates with good vocal fold closure.
- **Warmth (15%):** A balanced tone can be an indicator of good resonance.
- **Power (5%):** Loudness is secondary to health.
- **Expressiveness (5%):** Style is secondary to health.

**Formula:**
```typescript
const voiceIQ = 
    (Health * 0.40) +
    (Confidence * 0.20) +
    (Clarity * 0.15) +
    (Warmth * 0.15) +
    (Power * 0.05) +
    (Expressiveness * 0.05);
```
This model provides a score that is less about performance and more about the sustainable, healthy use of the voice, which is a stronger foundation for a health-centric app.
