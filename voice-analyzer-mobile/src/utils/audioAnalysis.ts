export function rms(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

export function rmsToDb(r: number): number {
  let db = 20 * Math.log10(Math.max(r, 1e-8));
  if (!isFinite(db)) db = -90;
  return Math.max(-90, Math.min(0, db));
}

export function dbToNormalized(db: number): number {
  const clamped = Math.max(-90, Math.min(0, db));
  return (clamped + 90) / 90;
}

export function autoCorrelatePitch(buf: Float32Array, sampleRate: number): number | null {
  const _rms = rms(buf);
  if (_rms < 0.01) return null;

  const mean = buf.reduce((a, b) => a + b, 0) / buf.length;
  const sig = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    sig[i] = buf[i] - mean;
  }

  const maxLag = Math.round(sampleRate / 50);
  const minLag = Math.round(sampleRate / 500);
  let bestLag = -1;
  let bestCorr = 0;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    for (let i = 0; i < sig.length - lag; i++) {
      corr += sig[i] * sig[i + lag];
    }
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  if (bestLag < 0 || bestCorr < 1e-3) return null;

  const freq = sampleRate / bestLag;
  return (freq >= 50 && freq <= 500) ? freq : null;
}
