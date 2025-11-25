export interface FormantResult {
  F1: number | null;
  F2: number | null;
  F3: number | null;
}

export function extractFormants(spectrum: number[], sampleRate: number): FormantResult {
  if (!spectrum.length) {
    return { F1: null, F2: null, F3: null };
  }
  // TODO: Implement LPC-based formant analysis
  return { F1: null, F2: null, F3: null };
}
