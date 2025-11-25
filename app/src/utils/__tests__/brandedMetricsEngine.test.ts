import { calculateBrandedMetricsFromPCM } from '../brandedMetricsEngine';

describe('Branded Metrics Engine', () => {
  it('should calculate metrics for silence', () => {
    const silence = new Float32Array(1024).fill(0);
    const metrics = calculateBrandedMetricsFromPCM(silence);

    expect(metrics.power).toBeLessThanOrEqual(5);
    expect(metrics.voiceIQ).toBeGreaterThanOrEqual(0);
    expect(metrics.voiceIQ).toBeLessThanOrEqual(100);
  });

  it('should calculate metrics for a sine wave (pure tone)', () => {
    const sampleRate = 44100;
    const frequency = 440; // A4
    const sineWave = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      sineWave[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
    }

    const metrics = calculateBrandedMetricsFromPCM(sineWave);

    expect(metrics.power).toBeGreaterThan(20);
    expect(metrics.clarity).toBeGreaterThan(10);
    expect(metrics.voiceIQ).toBeGreaterThan(10);
  });
});
