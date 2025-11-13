export interface VoiceSample {
  timestamp: number;
  amplitude: number;
  pitchHz: number | null;
  speakerId?: string;
  enhancedFeatures?: {
    spectralCentroid: number;
    spectralFlatness: number;
    spectralFlux: number;
    loudness: number;
    energy: number;
    zcr: number;
  };
  voiceMetrics?: {
    brightness: number;
    clarity: number;
    richness: number;
    energy: number;
    pitchStability: number;
  };
}

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';
export type PlaybackState = 'idle' | 'playing' | 'paused';
