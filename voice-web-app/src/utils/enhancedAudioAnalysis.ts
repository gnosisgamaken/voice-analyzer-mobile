import Meyda from 'meyda';
import type { EnhancedVoiceFeatures, VoiceMetrics } from './audioAnalysis';

export class VoiceAnalyzer {
  private analyzer: ReturnType<typeof Meyda.createMeydaAnalyzer> | null = null;
  private pitchHistory: (number | null)[] = [];
  private readonly PITCH_HISTORY_SIZE = 10;

  createAnalyzer(
    audioContext: AudioContext,
    source: MediaStreamAudioSourceNode
  ): void {
    this.analyzer = Meyda.createMeydaAnalyzer({
      audioContext,
      source,
      bufferSize: 2048,
      featureExtractors: [
        'rms',
        'energy',
        'zcr',
        'spectralCentroid',
        'spectralFlatness',
        'spectralFlux',
        'spectralSlope',
        'loudness',
        'mfcc',
      ],
      callback: () => {},
    });
    
    this.analyzer.start();
  }

  extractFeatures(currentPitch: number | null): EnhancedVoiceFeatures | null {
    if (!this.analyzer) return null;

    const features = this.analyzer.get([
      'rms',
      'energy',
      'zcr',
      'spectralCentroid',
      'spectralFlatness',
      'spectralFlux',
      'spectralSlope',
      'loudness',
      'mfcc',
    ]);

    if (!features) return null;

    this.updatePitchHistory(currentPitch);

    return {
      rms: typeof features.rms === 'number' ? features.rms : 0,
      loudness:
        typeof features.loudness === 'object' && features.loudness?.total
          ? features.loudness.total
          : 0,
      spectralCentroid:
        typeof features.spectralCentroid === 'number'
          ? features.spectralCentroid
          : 0,
      spectralFlatness:
        typeof features.spectralFlatness === 'number'
          ? features.spectralFlatness
          : 0,
      spectralFlux:
        'spectralFlux' in features && typeof features.spectralFlux === 'number'
          ? features.spectralFlux
          : 0,
      spectralSlope:
        typeof features.spectralSlope === 'number' ? features.spectralSlope : 0,
      zcr: typeof features.zcr === 'number' ? features.zcr : 0,
      mfcc: Array.isArray(features.mfcc)
        ? features.mfcc
        : new Array(13).fill(0),
      energy: typeof features.energy === 'number' ? features.energy : 0,
    };
  }

  calculateMetrics(features: EnhancedVoiceFeatures): VoiceMetrics {
    const brightness = this.normalizeBrightness(features.spectralCentroid);

    const clarity = Math.max(0, Math.min(1, 1 - features.spectralFlatness));

    const richness = Math.max(
      0,
      Math.min(1, features.loudness / 200)
    );

    const energy = Math.max(0, Math.min(1, features.energy / 2048));

    const pitchStability = this.calculatePitchStability();

    return {
      brightness,
      clarity,
      richness,
      energy,
      pitchStability,
    };
  }

  private normalizeBrightness(spectralCentroid: number): number {
    const minCentroid = 500;
    const maxCentroid = 4000;
    const clamped = Math.max(
      minCentroid,
      Math.min(maxCentroid, spectralCentroid)
    );
    return (clamped - minCentroid) / (maxCentroid - minCentroid);
  }

  private updatePitchHistory(pitch: number | null): void {
    this.pitchHistory.push(pitch);
    if (this.pitchHistory.length > this.PITCH_HISTORY_SIZE) {
      this.pitchHistory.shift();
    }
  }

  private calculatePitchStability(): number {
    if (this.pitchHistory.length < 3) return 1;

    const pitches = this.pitchHistory.filter(
      (p): p is number => p !== null
    );
    if (pitches.length < 2) return 0;

    const mean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
    
    if (mean < 1) return 0;
    
    const variance =
      pitches.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) /
      pitches.length;
    const stdDev = Math.sqrt(variance);

    const coefficientOfVariation = stdDev / mean;

    return Math.max(0, Math.min(1, 1 - coefficientOfVariation));
  }

  stop(): void {
    if (this.analyzer) {
      this.analyzer.stop();
      this.analyzer = null;
    }
    this.pitchHistory = [];
  }
}

export function interpretVoiceMetrics(metrics: VoiceMetrics): {
  brightnessLabel: string;
  clarityLabel: string;
  richnessLabel: string;
  energyLabel: string;
  stabilityLabel: string;
} {
  return {
    brightnessLabel:
      metrics.brightness > 0.7
        ? 'Bright'
        : metrics.brightness > 0.4
        ? 'Balanced'
        : 'Warm',
    clarityLabel:
      metrics.clarity > 0.7
        ? 'Clear'
        : metrics.clarity > 0.4
        ? 'Moderate'
        : 'Noisy',
    richnessLabel:
      metrics.richness > 0.7
        ? 'Rich'
        : metrics.richness > 0.4
        ? 'Moderate'
        : 'Thin',
    energyLabel:
      metrics.energy > 0.7
        ? 'Strong'
        : metrics.energy > 0.4
        ? 'Moderate'
        : 'Soft',
    stabilityLabel:
      metrics.pitchStability > 0.7
        ? 'Stable'
        : metrics.pitchStability > 0.4
        ? 'Variable'
        : 'Unstable',
  };
}
