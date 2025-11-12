export interface VoiceSample {
  timestamp: number;
  amplitude: number;
  pitchHz: number | null;
  speakerId?: string;
}

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';
export type PlaybackState = 'idle' | 'playing' | 'paused';
