import { VoiceAnalyzer, calculateVoiceMetrics } from '../enhancedAudioAnalysis';

const sampleRate = 44100;

const createBuffer = (frequency: number, seconds: number): Float32Array => {
  const length = Math.floor(sampleRate * seconds);
  const buffer = new Float32Array(length);
  const angular = (2 * Math.PI * frequency) / sampleRate;

  for (let i = 0; i < length; i++) {
    buffer[i] = Math.sin(angular * i);
  }

  return buffer;
};

describe('VoiceAnalyzer', () => {
  it('extracts stable features for a steady tone', () => {
    const analyzer = new VoiceAnalyzer(sampleRate, 2048);
    const buffer = createBuffer(300, 0.2);

    const features = analyzer.extractFeatures(buffer);
    expect(features.rms).toBeGreaterThan(0);
    expect(features.spectralCentroid).toBeGreaterThan(0);
    expect(features.spectralFlatness).toBeGreaterThanOrEqual(0);
    expect(features.spectralFlatness).toBeLessThanOrEqual(1);

    const spectrum = analyzer.getSpectrumBands(16);
    expect(spectrum).toHaveLength(16);
    expect(Math.max(...spectrum)).toBeLessThanOrEqual(1);
    expect(spectrum.some((band) => band > 0)).toBe(true);
  });

  it('normalizes voice metrics into 0-1 range', () => {
    const features = {
      spectralCentroid: 5000,
      spectralFlatness: 0.4,
      spectralFlux: 20,
      loudness: 0.7,
      energy: 0.08,
      zcr: 0.1,
      rms: 0.5,
    };

    const metrics = calculateVoiceMetrics(features);
    expect(metrics.brightness).toBeGreaterThan(0);
    expect(metrics.brightness).toBeLessThanOrEqual(1);
    expect(metrics.clarity).toBeCloseTo(features.spectralFlatness);
    expect(metrics.richness + metrics.clarity).toBeCloseTo(1, 2);
    expect(metrics.energy).toBeCloseTo(0.8, 1);
    expect(metrics.pitchStability).toBeGreaterThan(0);
  });
});
