import { useState, useRef, useCallback } from 'react';
import { useAudioRecorder as useExpoAudioRecorder, RecordingPresets, RecordingOptions } from 'expo-audio';
import { VoiceAnalyzer, AudioFeatures, calculateVoiceMetrics } from '../utils/enhancedAudioAnalysis';
import { autoCorrelatePitch } from '../utils/audioAnalysis';
import { VoiceSample, RecordingState, VoiceMetrics } from '../types';
import { getCurrentLocation, generateRecordingName, LocationData } from '../utils/locationService';
import { saveRecordingMetadata, saveAudioFile, initializeStorage } from '../utils/storage';

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
  const totalPausedDurationRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);
  const locationRef = useRef<LocationData | null>(null);
  const allSamplesRef = useRef<VoiceSample[]>([]);

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
      allSamplesRef.current.push(sample);

      const currentTime = Date.now();
      const elapsed = (currentTime - startTimeRef.current - totalPausedDurationRef.current) / 1000;
      setDuration(elapsed);
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      console.log('[SAVE DEBUG] 🎙️ Start recording called');
      
      await initializeStorage();
      locationRef.current = await getCurrentLocation();
      console.log('[SAVE DEBUG] Location:', locationRef.current ? locationRef.current.formattedAddress : 'none');
      
      startTimeRef.current = Date.now();
      totalPausedDurationRef.current = 0;
      pauseStartTimeRef.current = 0;
      allSamplesRef.current = [];
      analyzerRef.current.reset();
      
      console.log('[SAVE DEBUG] Recorder available:', !!recorder);
      console.log('[SAVE DEBUG] Recorder.record available:', !!recorder?.record);
      
      try {
        if (recorder?.record) {
          console.log('[SAVE DEBUG] Calling recorder.record()...');
          await recorder.record();
          console.log('[SAVE DEBUG] ✅ Recording started successfully');
        } else {
          console.log('[SAVE DEBUG] ⚠️ Recorder.record() not available');
        }
      } catch (recorderError) {
        console.warn('[SAVE DEBUG] ❌ Recorder error (expected in web preview):', recorderError);
      }
      
      setRecordingState('recording');
      intervalRef.current = setInterval(processAudioBuffer, 50);
    } catch (error) {
      console.error('[SAVE DEBUG] ❌ Failed to start recording:', error);
      setRecordingState('idle');
    }
  }, [processAudioBuffer, recorder]);

  const pauseRecording = useCallback(async () => {
    try {
      if (recorder?.pause) {
        await recorder.pause();
      }
    } catch (error) {
      console.warn('Recorder pause failed (expected in web preview):', error);
    }
    
    setRecordingState('paused');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    pauseStartTimeRef.current = Date.now();
  }, [recorder]);

  const resumeRecording = useCallback(async () => {
    try {
      if (recorder?.record) {
        await recorder.record();
      }
    } catch (error) {
      console.warn('Recorder resume failed (expected in web preview):', error);
    }
    
    setRecordingState('recording');
    
    if (pauseStartTimeRef.current > 0) {
      const pauseDuration = Date.now() - pauseStartTimeRef.current;
      totalPausedDurationRef.current += pauseDuration;
      pauseStartTimeRef.current = 0;
    }

    intervalRef.current = setInterval(processAudioBuffer, 50);
  }, [processAudioBuffer, recorder]);

  const calculateAverageMetrics = useCallback((): VoiceMetrics => {
    const samples = allSamplesRef.current;
    
    if (samples.length === 0) {
      return {
        brightness: 0.5,
        clarity: 0.5,
        richness: 0.5,
        energy: 0.5,
        pitchStability: 0.5,
      };
    }

    const sum = samples.reduce(
      (acc, sample) => ({
        brightness: acc.brightness + (sample.voiceMetrics?.brightness || 0),
        clarity: acc.clarity + (sample.voiceMetrics?.clarity || 0),
        richness: acc.richness + (sample.voiceMetrics?.richness || 0),
        energy: acc.energy + (sample.voiceMetrics?.energy || 0),
        pitchStability: acc.pitchStability + (sample.voiceMetrics?.pitchStability || 0),
      }),
      { brightness: 0, clarity: 0, richness: 0, energy: 0, pitchStability: 0 }
    );

    return {
      brightness: sum.brightness / samples.length,
      clarity: sum.clarity / samples.length,
      richness: sum.richness / samples.length,
      energy: sum.energy / samples.length,
      pitchStability: sum.pitchStability / samples.length,
    };
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      console.log('[SAVE DEBUG] 🛑 Stop recording called');
      console.log('[SAVE DEBUG] Current duration:', duration);
      console.log('[SAVE DEBUG] Recorder exists:', !!recorder);
      console.log('[SAVE DEBUG] Recorder.stop exists:', !!recorder?.stop);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      let uri: string | null | undefined;
      
      if (recorder?.stop) {
        console.log('[SAVE DEBUG] Calling recorder.stop()...');
        await recorder.stop();
        console.log('[SAVE DEBUG] recorder.stop() completed');
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        uri = recorder.uri;
        console.log('[SAVE DEBUG] Recorder URI after stop:', uri);
        console.log('[SAVE DEBUG] Recorder URI type:', typeof uri);
        console.log('[SAVE DEBUG] Recorder object keys:', recorder ? Object.keys(recorder) : 'no recorder');
        console.log('[SAVE DEBUG] Duration:', duration);
        console.log('[SAVE DEBUG] Will save:', uri && duration > 0);
      } else {
        console.log('[SAVE DEBUG] ❌ Recorder or recorder.stop() not available');
      }

      if (uri && duration > 0) {
        try {
          console.log('[SAVE DEBUG] Starting save process...');
          const recordingId = `recording_${startTimeRef.current}`;
          const savedUri = await saveAudioFile(uri, recordingId);
          console.log('[SAVE DEBUG] Audio file saved to:', savedUri);
          
          const averageMetrics = calculateAverageMetrics();
          const recordingName = generateRecordingName(locationRef.current, startTimeRef.current);

          await saveRecordingMetadata({
            id: recordingId,
            name: recordingName,
            timestamp: startTimeRef.current,
            duration,
            audioUri: savedUri,
            location: locationRef.current ? {
              latitude: locationRef.current.latitude,
              longitude: locationRef.current.longitude,
              city: locationRef.current.city,
              formattedAddress: locationRef.current.formattedAddress,
            } : undefined,
            averageMetrics,
          });

          console.log('[SAVE DEBUG] ✅ Recording saved successfully:', recordingName);
        } catch (saveError) {
          console.error('[SAVE DEBUG] ❌ Failed to save recording:', saveError);
        }
      } else {
        console.log('[SAVE DEBUG] ❌ Not saving - URI:', uri, 'Duration:', duration);
      }

      resetRecording();
      return uri || null;
    } catch (error) {
      console.error('[SAVE DEBUG] ❌ Error in stopRecording:', error);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      resetRecording();
      return null;
    }
  }, [recorder, duration, calculateAverageMetrics]);

  const resetRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setRecordingState('idle');
    setCurrentSample(null);
    setDuration(0);
    startTimeRef.current = 0;
    totalPausedDurationRef.current = 0;
    pauseStartTimeRef.current = 0;
    locationRef.current = null;
    allSamplesRef.current = [];
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
