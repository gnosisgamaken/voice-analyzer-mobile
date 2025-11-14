declare module 'fft-js' {
  export type ComplexArray = [number, number][];
  
  export function fft(signal: number[]): ComplexArray;
  export function ifft(phasors: ComplexArray): ComplexArray;
  export function frequencyMap(phasors: ComplexArray, sampleRate: number): number[];
  
  export default {
    fft,
    ifft,
    frequencyMap,
  };
}
