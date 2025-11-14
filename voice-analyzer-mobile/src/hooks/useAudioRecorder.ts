import { useState, useRef, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { VoiceAnalyzer, AudioFeatures, calculateVoiceMetrics } from '../utils/enhancedAudioAnalysis';
import { autoCorrelatePitch } from '../utils/audioAnalysis';
import { VoiceSample, RecordingState, VoiceMetrics } from '../types';
import { getCurrentLocation, generateRecordingName, LocationData } from '../utils/locationService';
import { saveRecordingMetadata, saveAudioFile, initializeStorage } from '../utils/storage';
import { ensureAudioPermission } from '../utils/permissions';

const RECORDING_OPTIONS = Audio.RecordingOptionsPresets.HIGH_QUALITY;

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

  const recorderRef = useRef<Audio.Recording | null>(null);
  const analyzerRef = useRef<VoiceAnalyzer>(new VoiceAnalyzer(44100, 2048));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const totalPausedDurationRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);
  const locationRef = useRef<LocationData | null>(null);
  const allSamplesRef = useRef<VoiceSample[]>([]);
  const recordingStartTimeRef = useRef<number>(0);

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
      
      if (Platform.OS === 'web') {
        console.log('[SAVE DEBUG] ⚠️ Web platform - recording simulation only');
        setRecordingState('recording');
        startTimeRef.current = Date.now();
        totalPausedDurationRef.current = 0;
        pauseStartTimeRef.current = 0;
        allSamplesRef.current = [];
        analyzerRef.current.reset();
        intervalRef.current = setInterval(processAudioBuffer, 50);
        return;
      }
      
      const hasPermission = await ensureAudioPermission();
      if (!hasPermission) {
        console.error('[RECORDING] ❌ Audio permission denied');
        Alert.alert(
          'Permission Required',
          'Microphone access is required to record audio. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }
      console.log('[RECORDING] ✅ Audio permission granted');
      
      try {
        console.log('[RECORDING] Setting audio mode for recording...');
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
        console.log('[RECORDING] ✅ Audio mode set successfully');
      } catch (audioModeError) {
        console.error('[RECORDING] ❌ Failed to set audio mode:', audioModeError);
      }
      
      await initializeStorage();
      locationRef.current = await getCurrentLocation();
      console.log('[RECORDING] Location:', locationRef.current ? locationRef.current.formattedAddress : 'none');
      
      startTimeRef.current = Date.now();
      recordingStartTimeRef.current = Date.now();
      totalPausedDurationRef.current = 0;
      pauseStartTimeRef.current = 0;
      allSamplesRef.current = [];
      analyzerRef.current.reset();
      
      console.log('[RECORDING] Creating new Audio.Recording instance...');
      const recording = new Audio.Recording();
      
      try {
        await recording.prepareToRecordAsync(RECORDING_OPTIONS);
        await recording.startAsync();
        recorderRef.current = recording;
        console.log('[RECORDING] ✅ Recording started successfully');
      } catch (recordError) {
        console.error('[RECORDING] ❌ Failed to start recording:', recordError);
        throw recordError;
      }
      
      setRecordingState('recording');
      intervalRef.current = setInterval(processAudioBuffer, 50);
    } catch (error) {
      console.error('[RECORDING] ❌ Failed to start recording:', error);
      setRecordingState('idle');
    }
  }, [processAudioBuffer]);

  const pauseRecording = useCallback(async () => {
    if (Platform.OS !== 'web') {
      try {
        if (recorderRef.current) {
          await recorderRef.current.pauseAsync();
        }
      } catch (error) {
        console.warn('[RECORDING] Pause failed:', error);
      }
    }
    
    setRecordingState('paused');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    pauseStartTimeRef.current = Date.now();
  }, []);

  const resumeRecording = useCallback(async () => {
    if (Platform.OS !== 'web') {
      try {
        if (recorderRef.current) {
          await recorderRef.current.startAsync();
        }
      } catch (error) {
        console.warn('[RECORDING] Resume failed:', error);
      }
    }
    
    setRecordingState('recording');
    
    if (pauseStartTimeRef.current > 0) {
      const pauseDuration = Date.now() - pauseStartTimeRef.current;
      totalPausedDurationRef.current += pauseDuration;
      pauseStartTimeRef.current = 0;
    }

    intervalRef.current = setInterval(processAudioBuffer, 50);
  }, [processAudioBuffer]);

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
      console.log('[RECORDING] 🛑 Stop recording called');
      console.log('[RECORDING] Platform:', Platform.OS);
      console.log('[RECORDING] Current duration:', duration);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (Platform.OS === 'web') {
        console.log('[RECORDING] ⚠️ Web platform - no real audio to save');
        resetRecording();
        return null;
      }

      console.log('[RECORDING] Recorder exists:', !!recorderRef.current);
      
      let uri: string | null | undefined;
      
      if (recorderRef.current) {
        try {
          console.log('[RECORDING] Stopping recording...');
          await recorderRef.current.stopAndUnloadAsync();
          uri = recorderRef.current.getURI();
          console.log('[RECORDING] Recording stopped, URI:', uri);
          
          if (uri) {
            const { File } = await import('expo-file-system');
            
            const recorderFile = new File(uri);
            const fileExists = recorderFile.exists;
            const fileSize = recorderFile.size || 0;
            
            console.log('[RECORDING] File exists:', fileExists);
            console.log('[RECORDING] File size:', fileSize, 'bytes');
            
            if (!fileExists || fileSize === 0) {
              console.error('[RECORDING] ❌ File is empty or missing');
              uri = null;
            } else {
              console.log('[RECORDING] ✅ Recording file is valid');
            }
          }
        } catch (stopError) {
          console.error('[RECORDING] ❌ Error stopping recording:', stopError);
          uri = null;
        }
      } else {
        console.log('[RECORDING] ❌ Recorder not available');
      }

      if (uri && duration > 0) {
        try {
          console.log('[RECORDING] Starting save process...');
          const recordingId = `recording_${startTimeRef.current}`;
          const savedUri = await saveAudioFile(uri, recordingId);
          console.log('[RECORDING] Audio file saved to:', savedUri);
          
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

          console.log('[RECORDING] ✅ Recording saved successfully:', recordingName);
        } catch (saveError) {
          console.error('[RECORDING] ❌ Failed to save recording:', saveError);
        }
      } else {
        console.log('[RECORDING] ❌ Not saving - URI:', uri, 'Duration:', duration);
      }

      resetRecording();
      return uri || null;
    } catch (error) {
      console.error('[RECORDING] ❌ Error in stopRecording:', error);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      resetRecording();
      return null;
    }
  }, [duration, calculateAverageMetrics]);

  const resetRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (recorderRef.current) {
      recorderRef.current = null;
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
