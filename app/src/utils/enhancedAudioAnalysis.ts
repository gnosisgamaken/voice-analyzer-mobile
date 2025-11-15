import FFT from 'fft-js';
import { rms } from './audioAnalysis';
import { VoiceMetricsEngine, type BrandedMetrics, type AdvancedVoiceFeatures } from './VoiceMetricsEngine';

export interface AudioFeatures {
  spectralCentroid: number;
  spectralFlatness: number;
  spectralFlux: number;
  loudness: number;
  energy: number;
  zcr: number;
  rms: number;
  mfcc?: number[];
}

const voiceMetricsEngine = new VoiceMetricsEngine();

export class VoiceAnalyzer {
  private previousMagnitudes: number[] = [];
  private lastMagnitudes: number[] = [];
  private readonly sampleRate: number;
  private readonly fftSize: number;

  constructor(sampleRate: number = 44100, fftSize: number = 2048) {
    this.sampleRate = sampleRate;
    this.fftSize = fftSize;
  }

  extractFeatures(audioBuffer: Float32Array): AudioFeatures {
    const bufferSize = Math.min(this.fftSize, audioBuffer.length);
    const paddedBuffer = new Array(this.fftSize).fill(0);
    
    for (let i = 0; i < bufferSize; i++) {
      paddedBuffer[i] = audioBuffer[i];
    }

    const magnitudes = this.computeMagnitudes(paddedBuffer);
    
    const spectralCentroid = this.calculateSpectralCentroid(magnitudes);
    const spectralFlatness = this.calculateSpectralFlatness(magnitudes);
    const spectralFlux = this.calculateSpectralFlux(magnitudes);
    const zcr = this.calculateZCR(audioBuffer);
    const rmsValue = rms(audioBuffer);
    const energy = this.calculateEnergy(audioBuffer);
    const loudness = this.calculateLoudness(magnitudes);

    this.previousMagnitudes = magnitudes;
    this.lastMagnitudes = magnitudes;

    return {
      spectralCentroid,
      spectralFlatness,
      spectralFlux,
      loudness,
      energy,
      zcr,
      rms: rmsValue,
    };
  }

  private computeMagnitudes(signal: number[]): number[] {
    const phasors = FFT.fft(signal);
    const magnitudes: number[] = [];
    
    for (let i = 0; i < phasors.length / 2; i++) {
      const real = phasors[i][0];
      const imag = phasors[i][1];
      const magnitude = Math.sqrt(real * real + imag * imag);
      magnitudes.push(magnitude);
    }
    
    return magnitudes;
  }

  private calculateSpectralCentroid(magnitudes: number[]): number {
    let weightedSum = 0;
    let sum = 0;
    
    for (let i = 0; i < magnitudes.length; i++) {
      const frequency = (i * this.sampleRate) / (2 * magnitudes.length);
      weightedSum += frequency * magnitudes[i];
      sum += magnitudes[i];
    }
    
    return sum === 0 ? 0 : weightedSum / sum;
  }

  private calculateSpectralFlatness(magnitudes: number[]): number {
    let geometricMean = 0;
    let arithmeticMean = 0;
    let count = 0;
    
    for (let i = 0; i < magnitudes.length; i++) {
      if (magnitudes[i] > 0) {
        geometricMean += Math.log(magnitudes[i]);
        arithmeticMean += magnitudes[i];
        count++;
      }
    }
    
    if (count === 0) return 0;
    
    geometricMean = Math.exp(geometricMean / count);
    arithmeticMean = arithmeticMean / count;
    
    return arithmeticMean === 0 ? 0 : geometricMean / arithmeticMean;
  }

  private calculateSpectralFlux(magnitudes: number[]): number {
    if (this.previousMagnitudes.length === 0) {
      return 0;
    }
    
    const minLength = Math.min(magnitudes.length, this.previousMagnitudes.length);
    let flux = 0;
    
    for (let i = 0; i < minLength; i++) {
      const diff = magnitudes[i] - this.previousMagnitudes[i];
      flux += diff * diff;
    }
    
    return Math.sqrt(flux);
  }

  private calculateZCR(audioBuffer: Float32Array): number {
    let crossings = 0;
    
    for (let i = 1; i < audioBuffer.length; i++) {
      if ((audioBuffer[i] >= 0 && audioBuffer[i - 1] < 0) ||
          (audioBuffer[i] < 0 && audioBuffer[i - 1] >= 0)) {
        crossings++;
      }
    }
    
    return crossings / audioBuffer.length;
  }

  private calculateEnergy(audioBuffer: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < audioBuffer.length; i++) {
      sum += audioBuffer[i] * audioBuffer[i];
    }
    return sum / audioBuffer.length;
  }

  private calculateLoudness(magnitudes: number[]): number {
    const aWeighting = this.applyAWeighting(magnitudes);
    let sum = 0;
    
    for (let i = 0; i < aWeighting.length; i++) {
      sum += aWeighting[i];
    }
    
    return sum / aWeighting.length;
  }

  private applyAWeighting(magnitudes: number[]): number[] {
    const weighted: number[] = [];
    
    for (let i = 0; i < magnitudes.length; i++) {
      const frequency = (i * this.sampleRate) / (2 * magnitudes.length);
      const weight = this.aWeightingCoefficient(frequency);
      weighted.push(magnitudes[i] * weight);
    }
    
    return weighted;
  }

  private aWeightingCoefficient(frequency: number): number {
    if (frequency === 0) return 0;
    
    const f2 = frequency * frequency;
    const numerator = 12194 * 12194 * f2 * f2;
    const denominator = 
      (f2 + 20.6 * 20.6) *
      Math.sqrt((f2 + 107.7 * 107.7) * (f2 + 737.9 * 737.9)) *
      (f2 + 12194 * 12194);
    
    return numerator / denominator;
  }

  reset(): void {
    this.previousMagnitudes = [];
    this.lastMagnitudes = [];
  }

  getSpectrumBands(bandCount: number = 32): number[] {
    if (!this.lastMagnitudes.length) {
      return new Array(bandCount).fill(0);
    }

    const chunkSize = Math.max(1, Math.floor(this.lastMagnitudes.length / bandCount));
    const bands: number[] = [];

    for (let i = 0; i < bandCount; i++) {
      const start = i * chunkSize;
      let peak = 0;
      for (let j = start; j < start + chunkSize && j < this.lastMagnitudes.length; j++) {
        peak = Math.max(peak, this.lastMagnitudes[j]);
      }
      bands.push(peak);
    }

    const max = Math.max(...bands, 1);
    return bands.map((value) => value / max);
  }
}

export function calculateVoiceMetrics(features: AudioFeatures): {
  brightness: number;
  clarity: number;
  richness: number;
  energy: number;
  pitchStability: number;
} {
  const brightness = normalizeSpectralCentroid(features.spectralCentroid);
  
  const clarity = features.spectralFlatness;
  
  const richness = 1 - features.spectralFlatness;
  
  const energy = normalizeEnergy(features.energy);
  
  const pitchStability = 1 - Math.min(features.spectralFlux / 1000, 1);

  return {
    brightness: clamp(brightness, 0, 1),
    clarity: clamp(clarity, 0, 1),
    richness: clamp(richness, 0, 1),
    energy: clamp(energy, 0, 1),
    pitchStability: clamp(pitchStability, 0, 1),
  };
}

export function calculateBrandedVoiceMetrics(
  features: AudioFeatures,
  advanced?: AdvancedVoiceFeatures
): BrandedMetrics {
  return voiceMetricsEngine.calculateFromAudioFeatures(features, advanced);
}

function normalizeSpectralCentroid(centroid: number): number {
  const minCentroid = 200;
  const maxCentroid = 8000;
  
  return (centroid - minCentroid) / (maxCentroid - minCentroid);
}

function normalizeEnergy(energy: number): number {
  const minEnergy = 0;
  const maxEnergy = 0.1;
  
  return (energy - minEnergy) / (maxEnergy - minEnergy);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function interpretMetric(
  metricName: string,
  value: number
): { label: string; color: string } {
  const percentage = Math.round(value * 100);

  switch (metricName) {
    case 'brightness':
      if (percentage < 30) return { label: 'Warm', color: '#FF9500' };
      if (percentage < 70) return { label: 'Balanced', color: '#34C759' };
      return { label: 'Bright', color: '#007AFF' };

    case 'clarity':
      if (percentage < 30) return { label: 'Noisy', color: '#FF3B30' };
      if (percentage < 70) return { label: 'Clear', color: '#34C759' };
      return { label: 'Very Clear', color: '#007AFF' };

    case 'richness':
      if (percentage < 30) return { label: 'Thin', color: '#FF3B30' };
      if (percentage < 70) return { label: 'Full', color: '#34C759' };
      return { label: 'Rich', color: '#007AFF' };

    case 'energy':
      if (percentage < 30) return { label: 'Soft', color: '#8E8E93' };
      if (percentage < 70) return { label: 'Moderate', color: '#34C759' };
      return { label: 'Strong', color: '#FF3B30' };

    case 'pitchStability':
      if (percentage < 30) return { label: 'Unstable', color: '#FF3B30' };
      if (percentage < 70) return { label: 'Stable', color: '#34C759' };
      return { label: 'Very Stable', color: '#007AFF' };

    default:
      return { label: 'Unknown', color: '#8E8E93' };
  }
}
