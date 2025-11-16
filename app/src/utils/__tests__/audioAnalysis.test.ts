import { autoCorrelatePitch, rms, rmsToDb, dbToNormalized } from '../audioAnalysis';

const createSineWave = (frequency: number, sampleRate: number, durationSeconds: number): Float32Array => {
  const length = Math.floor(sampleRate * durationSeconds);
  const buffer = new Float32Array(length);
  const angular = (2 * Math.PI * frequency) / sampleRate;

  for (let i = 0; i < length; i++) {
    buffer[i] = Math.sin(angular * i);
  }

  return buffer;
};

describe('audioAnalysis utilities', () => {
  const sampleRate = 44100;

  it('detects the pitch of a pure sine wave', () => {
    const buffer = createSineWave(220, sampleRate, 0.1);
    const detected = autoCorrelatePitch(buffer, sampleRate);

    expect(detected).not.toBeNull();
    expect(detected!).toBeGreaterThan(215);
    expect(detected!).toBeLessThan(225);
  });

  it('returns null pitch for silence', () => {
    const silence = new Float32Array(sampleRate / 10);
    expect(autoCorrelatePitch(silence, sampleRate)).toBeNull();
  });

  it('computes RMS and converts between dB/normalized domains', () => {
    const buffer = createSineWave(440, sampleRate, 0.05);
    const value = rms(buffer);
    const db = rmsToDb(value);
    const normalized = dbToNormalized(db);

    expect(value).toBeGreaterThan(0.6);
    expect(value).toBeLessThan(0.8);
    expect(db).toBeLessThan(0);
    expect(db).toBeGreaterThan(-5);
    expect(normalized).toBeGreaterThan(0.9);
    expect(normalized).toBeLessThan(1.01);
  });
});
