import type { BrandedMetrics } from '../utils/VoiceMetricsEngine';

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
  brandedMetrics?: BrandedMetrics;
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

export interface SpectrumFrame {
  time: number;
  bands: number[];
}

export interface RecordingAnalysis {
  waveform: number[];
  spectrum: SpectrumFrame[];
}

export interface StoredRecording {
  id: string;
  name: string;
  timestamp: number;
  duration: number;
  audioUri: string;
  processingStatus?: 'processing' | 'ready' | 'error';
  processingError?: string;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    formattedAddress?: string;
  };
  averageMetrics: VoiceMetrics;
  averageBrandedMetrics?: BrandedMetrics;
  analysis?: RecordingAnalysis;
}
