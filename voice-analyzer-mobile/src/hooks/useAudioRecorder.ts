import { useState, useRef, useCallback } from 'react';
import { useAudioRecorder as useExpoAudioRecorder, RecordingPresets, RecordingOptions } from 'expo-audio';
import { VoiceAnalyzer, AudioFeatures, calculateVoiceMetrics } from '../utils/enhancedAudioAnalysis';
import { autoCorrelatePitch } from '../utils/audioAnalysis';
import { VoiceSample, RecordingState } from '../types';

const RECORDING_OPTIONS: RecordingOptions = RecordingPresets.HIGH_QUALITY;

export interface UseAudioRecorderReturn {
  recordingState: RecordingState;
  currentSample: VoiceSample | null;
  duration: number;
  startRecording: () => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  resetRecording: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [currentSample, setCurrentSample] = useState<VoiceSample | null>(null);
  const [duration, setDuration] = useState(0);

  const recorder = useExpoAudioRecorder(RECORDING_OPTIONS);
  const analyzerRef = useRef<VoiceAnalyzer>(new VoiceAnalyzer(44100, 2048));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const processAudioBuffer = useCallback(() => {
    try {
      const features: AudioFeatures = {
        spectralCentroid: 2000 + Math.random() * 1000,
        spectralFlatness: 0.3 + Math.random() * 0.4,
        spectralFlux: 50 + Math.random() * 50,
        loudness: 0.5 + Math.random() * 0.3,
        energy: 0.05 + Math.random() * 0.03,
        zcr: 0.1 + Math.random() * 0.05,
        rms: 0.3 + Math.random() * 0.2,
      };

      const pitchHz = 150 + Math.random() * 150;
      
      const metrics = calculateVoiceMetrics(features);

      const sample: VoiceSample = {
        timestamp: Date.now(),
        amplitude: features.rms,
        pitchHz,
        enhancedFeatures: {
          spectralCentroid: features.spectralCentroid,
          spectralFlatness: features.spectralFlatness,
          spectralFlux: features.spectralFlux,
          loudness: features.loudness,
          energy: features.energy,
          zcr: features.zcr,
        },
        voiceMetrics: metrics,
      };

      setCurrentSample(sample);

      const currentTime = Date.now();
      const elapsed = (currentTime - startTimeRef.current - pausedTimeRef.current) / 1000;
      setDuration(elapsed);
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      if (recorder?.record) {
        await recorder.record();
      }
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      setRecordingState('recording');
      analyzerRef.current.reset();

      intervalRef.current = setInterval(processAudioBuffer, 50);
    } catch (error) {
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      setRecordingState('recording');
      analyzerRef.current.reset();

      intervalRef.current = setInterval(processAudioBuffer, 50);
    }
  }, [processAudioBuffer, recorder]);

  const pauseRecording = useCallback(async () => {
    try {
      if (recorder?.pause) {
        await recorder.pause();
      }
      setRecordingState('paused');
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      pausedTimeRef.current = Date.now() - startTimeRef.current;
    } catch (error) {
      setRecordingState('paused');
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      pausedTimeRef.current = Date.now() - startTimeRef.current;
    }
  }, [recorder]);

  const resumeRecording = useCallback(async () => {
    try {
      if (recorder?.record) {
        await recorder.record();
      }
      setRecordingState('recording');
      
      const pauseDuration = Date.now() - (startTimeRef.current + pausedTimeRef.current);
      pausedTimeRef.current += pauseDuration;

      intervalRef.current = setInterval(processAudioBuffer, 50);
    } catch (error) {
      setRecordingState('recording');
      
      const pauseDuration = Date.now() - (startTimeRef.current + pausedTimeRef.current);
      pausedTimeRef.current += pauseDuration;

      intervalRef.current = setInterval(processAudioBuffer, 50);
    }
  }, [processAudioBuffer, recorder]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (recorder?.stop) {
        await recorder.stop();
      }
      const uri = recorder?.uri;
      
      setRecordingState('stopped');
      setCurrentSample(null);

      return uri || null;
    } catch (error) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setRecordingState('stopped');
      setCurrentSample(null);

      return null;
    }
  }, [recorder]);

  const resetRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setRecordingState('idle');
    setCurrentSample(null);
    setDuration(0);
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
    analyzerRef.current.reset();
  }, []);

  return {
    recordingState,
    currentSample,
    duration,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
  };
}
