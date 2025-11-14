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
  voiceMetrics?: VoiceMetrics;
}

export interface VoiceMetrics {
  brightness: number;
  clarity: number;
  richness: number;
  energy: number;
  pitchStability: number;
}

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';
export type PlaybackState = 'idle' | 'playing' | 'paused';

export interface StoredRecording {
  id: string;
  name: string;
  timestamp: number;
  duration: number;
  audioUri: string;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    formattedAddress?: string;
  };
  averageMetrics: VoiceMetrics;
}
