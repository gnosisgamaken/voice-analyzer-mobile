import { useState, useRef, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { Buffer } from 'buffer';
import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AVLinearPCMBitDepthKeyIOSType,
  AudioSet,
} from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import {
  VoiceAnalyzer,
  calculateVoiceMetrics,
  calculateBrandedVoiceMetrics,
  type AudioFeatures,
} from '../utils/enhancedAudioAnalysis';
import { autoCorrelatePitch } from '../utils/audioAnalysis';
import { VoiceSample, RecordingState, VoiceMetrics } from '../types';
import { getCurrentLocation, generateRecordingName, LocationData } from '../utils/locationService';
import { saveRecordingMetadata, saveAudioFile, initializeStorage, updateRecordingMetadata } from '../utils/storage';
import { ensureAudioPermission, checkAudioPermission } from '../utils/permissions';
import { logger } from '../utils/logger';
import { AUDIO_CONFIG } from '../constants';
import type { BrandedMetrics, AdvancedVoiceFeatures } from '../utils/VoiceMetricsEngine';
import { analyzeVoiceHealth } from '../utils/voiceHealthMetrics';
import { analyzeFluency } from '../utils/speechFluency';
import { analyzeRecordingFile } from '../utils/audioFileAnalysis';
import { computeAverageVoiceMetrics, computeAverageBrandedMetrics } from '../utils/metricsAggregation';

const RECORDING_AUDIO_SET: AudioSet = {
  AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
  AudioSourceAndroid: AudioSourceAndroidType.MIC,
  AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
  AVFormatIDKeyIOS: AVEncodingOption.wav,
  AVLinearPCMBitDepthKeyIOS: AVLinearPCMBitDepthKeyIOSType.bit16,
  AVLinearPCMIsBigEndianKeyIOS: false,
  AVLinearPCMIsFloatKeyIOS: false,
  AVLinearPCMIsNonInterleavedIOS: false,
  AVNumberOfChannelsKeyIOS: 1,
  AVSampleRateKeyIOS: 44100,
};

const WAV_HEADER_BYTES = 44;
const PCM_BYTES_PER_SAMPLE = 2;

// NOTE: Real-time audio analysis is currently simulated
// Real PCM audio streaming requires a custom native module
// See AUDIO_IMPLEMENTATION_NOTES.md for details

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

  const recorderRef = useRef<AudioRecorderPlayer | null>(null);
  const recordingFileRef = useRef<string | null>(null);
  const analyzerRef = useRef<VoiceAnalyzer>(new VoiceAnalyzer(44100, 2048));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isReadingRef = useRef(false);
  const startTimeRef = useRef<number>(0);
  const totalPausedDurationRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);
  const locationRef = useRef<LocationData | null>(null);
  const allSamplesRef = useRef<VoiceSample[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const pitchHistoryRef = useRef<number[]>([]);
  const amplitudeHistoryRef = useRef<number[]>([]);
  const energyHistoryRef = useRef<number[]>([]);

  const getRecorder = (): AudioRecorderPlayer => {
    if (!recorderRef.current) {
      recorderRef.current = new AudioRecorderPlayer();
    }
    return recorderRef.current;
  };

  const stripFileScheme = useCallback((uri: string): string => {
    return uri.startsWith('file://') ? uri.replace('file://', '') : uri;
  }, []);

  const ingestFeatures = useCallback((features: AudioFeatures, pitchHz: number | null) => {
    const metrics = calculateVoiceMetrics(features);

    pitchHistoryRef.current.push(pitchHz ?? 0);
    amplitudeHistoryRef.current.push(features.rms);
    energyHistoryRef.current.push(features.energy);

    if (pitchHistoryRef.current.length > 400) pitchHistoryRef.current.shift();
    if (amplitudeHistoryRef.current.length > 400) amplitudeHistoryRef.current.shift();
    if (energyHistoryRef.current.length > 400) energyHistoryRef.current.shift();

    const voiceHealth = analyzeVoiceHealth({
      pitchHzHistory: pitchHistoryRef.current.filter((hz) => hz > 0),
      amplitudeHistory: amplitudeHistoryRef.current,
    });

    const fluency = analyzeFluency(energyHistoryRef.current, AUDIO_CONFIG.analysisInterval);
    const pitchValues = pitchHistoryRef.current.filter((hz) => hz > 0);
    const pitchRange =
      pitchValues.length > 1
        ? Math.max(...pitchValues) - Math.min(...pitchValues)
        : null;

    const advancedFeatures: AdvancedVoiceFeatures = {
      jitter: voiceHealth.jitter ?? undefined,
      shimmer: voiceHealth.shimmer ?? undefined,
      hnr: voiceHealth.hnr ?? undefined,
      pitchRange: pitchRange ?? undefined,
      pauseScore: fluency.fluencyScore ?? undefined,
      tempoVariability:
        energyHistoryRef.current.length > 1
          ? Math.min(
              1,
              Math.sqrt(
                energyHistoryRef.current.reduce(
                  (sum, energy) => sum + Math.pow(energy - metrics.energy, 2),
                  0,
                ) / energyHistoryRef.current.length,
              ),
            )
          : undefined,
    };

    const brandedMetrics = calculateBrandedVoiceMetrics(features, advancedFeatures);

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
      brandedMetrics,
    };

    setCurrentSample(sample);
    allSamplesRef.current.push(sample);

    const currentTime = Date.now();
    const elapsed =
      (currentTime - startTimeRef.current - totalPausedDurationRef.current) / 1000;
    setDuration(elapsed);
  }, []);

  const readLatestFrame = useCallback(async (): Promise<Float32Array | null> => {
    if (!recordingFileRef.current) {
      return null;
    }

    const filePath = stripFileScheme(recordingFileRef.current);
    try {
      const stats = await RNFS.stat(filePath);
      const fileSize = Number(stats.size);
      const bytesPerFrame = AUDIO_CONFIG.fftSize * PCM_BYTES_PER_SAMPLE;

      if (fileSize <= WAV_HEADER_BYTES + PCM_BYTES_PER_SAMPLE) {
        return null;
      }

      const start = Math.max(WAV_HEADER_BYTES, fileSize - bytesPerFrame);
      const length = Math.min(bytesPerFrame, fileSize - start);
      if (length <= 0) {
        return null;
      }

      const base64 = await RNFS.read(filePath, length, start, 'base64');
      const buffer = Buffer.from(base64, 'base64');
      const sampleCount = Math.floor(buffer.length / PCM_BYTES_PER_SAMPLE);
      if (!sampleCount) {
        return null;
      }

      const temp = new Float32Array(sampleCount);
      for (let i = 0; i < sampleCount; i++) {
        temp[i] = buffer.readInt16LE(i * PCM_BYTES_PER_SAMPLE) / 32768;
      }

      const frameSize = AUDIO_CONFIG.fftSize;
      const samples = new Float32Array(frameSize);
      if (sampleCount >= frameSize) {
        samples.set(temp.subarray(sampleCount - frameSize));
      } else {
        samples.set(temp, frameSize - sampleCount);
      }
      return samples;
    } catch (error) {
      logger.warn('Unable to read PCM chunk:', error);
      return null;
    }
  }, [stripFileScheme]);

  const processRecordingAnalysis = useCallback(
    async (recordingId: string, savedUri: string) => {
      try {
        const analysisResult = await analyzeRecordingFile(savedUri);
        if (analysisResult) {
          await updateRecordingMetadata(recordingId, {
            averageMetrics: analysisResult.averageMetrics,
            averageBrandedMetrics: analysisResult.averageBrandedMetrics ?? undefined,
            analysis: {
              waveform: analysisResult.waveform,
              spectrum: analysisResult.spectrum,
            },
            processingStatus: 'ready',
          });
        } else {
          await updateRecordingMetadata(recordingId, {
            processingStatus: 'ready',
          });
        }
      } catch (error) {
        logger.error('Background analysis failed:', error);
        await updateRecordingMetadata(recordingId, {
          processingStatus: 'ready',
        });
      }
    },
    [],
  );

  const simulateFeatures = useCallback(() => {
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
    ingestFeatures(features, pitchHz);
  }, [ingestFeatures]);

  const processAudioBuffer = useCallback(() => {
    if (Platform.OS === 'web' || !recordingFileRef.current) {
      simulateFeatures();
      return;
    }

    if (isReadingRef.current) {
      return;
    }

    isReadingRef.current = true;
    readLatestFrame()
      .then((pcm) => {
        if (pcm && pcm.length) {
          const features = analyzerRef.current.extractFeatures(pcm);
          const pitchHz = autoCorrelatePitch(pcm, AUDIO_CONFIG.sampleRate);
          ingestFeatures(features, pitchHz);
        } else {
          simulateFeatures();
        }
      })
      .catch((error) => {
        logger.warn('Real-time audio processing failed:', error);
        simulateFeatures();
      })
      .finally(() => {
        isReadingRef.current = false;
      });
  }, [ingestFeatures, readLatestFrame, simulateFeatures]);

  const startRecording = useCallback(async () => {
    try {
      logger.debug('Start recording called');
      
      if (Platform.OS === 'web') {
        logger.debug('Web platform - recording simulation only');
        setRecordingState('recording');
        startTimeRef.current = Date.now();
        totalPausedDurationRef.current = 0;
        pauseStartTimeRef.current = 0;
        allSamplesRef.current = [];
        analyzerRef.current.reset();
        intervalRef.current = setInterval(processAudioBuffer, AUDIO_CONFIG.analysisInterval);
        return;
      }
      
      const hasPermission = await ensureAudioPermission();
      if (!hasPermission) {
        logger.error('Audio permission denied');
        const status = await checkAudioPermission();
        const actions = status.canAskAgain
          ? [{ text: 'OK' as const }]
          : [
              { text: 'Cancel', style: 'cancel' as const },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ];
        Alert.alert(
          'Permission Required',
          status.canAskAgain
            ? 'Microphone access is required to record audio. Please accept the upcoming permission prompt.'
            : 'Microphone access is blocked. Enable it in Settings → Privacy → Microphone for Voice Analyzer.',
          actions
        );
        return;
      }
      logger.info('Audio permission granted');
      
      await initializeStorage();
      locationRef.current = await getCurrentLocation();
      logger.debug('Location:', locationRef.current?.formattedAddress || 'none');
      
      startTimeRef.current = Date.now();
      recordingStartTimeRef.current = Date.now();
      totalPausedDurationRef.current = 0;
      pauseStartTimeRef.current = 0;
      allSamplesRef.current = [];
      analyzerRef.current.reset();
      
      const recorder = getRecorder();
      const timestamp = Date.now();
      const documentPath = `${RNFS.DocumentDirectoryPath}/temp_voice_${timestamp}.wav`;
      const filePath = Platform.OS === 'ios'
        ? `file://${documentPath}`
        : documentPath;
      recordingFileRef.current = filePath;

      try {
        await recorder.startRecorder(filePath, RECORDING_AUDIO_SET);
        logger.info('Recording started successfully at', filePath);
      } catch (recordError) {
        logger.error('Failed to start recording:', recordError);
        recordingFileRef.current = null;
        throw recordError;
      }
      
      setRecordingState('recording');
      intervalRef.current = setInterval(processAudioBuffer, AUDIO_CONFIG.analysisInterval);
    } catch (error) {
      logger.error('Failed to start recording:', error);
      setRecordingState('idle');
    }
  }, [processAudioBuffer]);

  const pauseRecording = useCallback(async () => {
    if (Platform.OS !== 'web') {
      try {
        if (recorderRef.current) {
          await recorderRef.current.pauseRecorder();
        }
      } catch (error) {
        logger.warn('Pause failed:', error);
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
          await recorderRef.current.resumeRecorder();
        }
      } catch (error) {
        logger.warn('Resume failed:', error);
      }
    }
    
    setRecordingState('recording');
    
    if (pauseStartTimeRef.current > 0) {
      const pauseDuration = Date.now() - pauseStartTimeRef.current;
      totalPausedDurationRef.current += pauseDuration;
      pauseStartTimeRef.current = 0;
    }

      intervalRef.current = setInterval(processAudioBuffer, AUDIO_CONFIG.analysisInterval);
  }, [processAudioBuffer]);

  const calculateAverageMetrics = useCallback((): VoiceMetrics => {
    return computeAverageVoiceMetrics(allSamplesRef.current);
  }, []);

  const calculateAverageBrandedMetrics = useCallback((): BrandedMetrics | null => {
    return computeAverageBrandedMetrics(allSamplesRef.current);
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      logger.debug('Stop recording called');
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (Platform.OS === 'web') {
        logger.debug('Web platform - no real audio to save');
        resetRecording();
        return null;
      }

      let uri: string | null = null;
      
      if (recorderRef.current) {
        try {
          const recorder = recorderRef.current;
          const resultPath = await recorder.stopRecorder();
          recorder.removeRecordBackListener();
          uri = recordingFileRef.current || resultPath || null;
          logger.debug('Recording stopped, URI:', uri);
        } catch (stopError) {
          logger.error('Error stopping recording:', stopError);
          uri = null;
        }
      } else {
        logger.warn('Recorder not available');
      }

      recordingFileRef.current = null;
      recorderRef.current = null;

      if (uri) {
        const normalizedUri = uri.startsWith('file://') ? uri : `file://${uri}`;
        const filePath = normalizedUri.replace('file://', '');
        try {
          const exists = await RNFS.exists(filePath);
          if (!exists) {
            logger.error('Recorded file missing on disk');
            uri = null;
          } else {
            const stats = await RNFS.stat(filePath);
            if (!stats || Number(stats.size) === 0) {
              logger.error('Recorded file is empty');
              uri = null;
            } else {
              uri = normalizedUri;
            }
          }
        } catch (fsError) {
          logger.error('Failed to inspect recorded file:', fsError);
          uri = null;
        }
      }

      let finalUri: string | null = null;

      if (uri && duration > 0) {
        try {
          const recordingId = `recording_${startTimeRef.current}`;
          const savedUri = await saveAudioFile(uri, recordingId);
          finalUri = savedUri;
          logger.debug('Audio file saved to:', savedUri);

          const averageMetrics = calculateAverageMetrics();
          const averageBrandedMetrics = calculateAverageBrandedMetrics() || undefined;
          const recordingName = generateRecordingName(locationRef.current, startTimeRef.current);

          await saveRecordingMetadata({
            id: recordingId,
            name: recordingName,
            timestamp: startTimeRef.current,
            duration,
            audioUri: savedUri,
            location: locationRef.current
              ? {
                  latitude: locationRef.current.latitude,
                  longitude: locationRef.current.longitude,
                  city: locationRef.current.city,
                  formattedAddress: locationRef.current.formattedAddress,
                }
              : undefined,
            averageMetrics,
            averageBrandedMetrics,
            processingStatus: 'processing',
          });

          setTimeout(() => {
            processRecordingAnalysis(recordingId, savedUri);
          }, 0);

          logger.info('Recording saved, background analysis scheduled:', recordingName);
        } catch (saveError) {
          logger.error('Failed to save recording:', saveError);
        }
      } else {
        logger.warn('Not saving - URI:', uri, 'Duration:', duration);
      }

      resetRecording();
      return finalUri;
    } catch (error) {
      logger.error('Error in stopRecording:', error);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      resetRecording();
      return null;
    }
  }, [duration, calculateAverageMetrics, calculateAverageBrandedMetrics, processRecordingAnalysis]);

  const resetRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (recorderRef.current) {
      recorderRef.current = null;
    }

    recordingFileRef.current = null;

    setRecordingState('idle');
    setCurrentSample(null);
    setDuration(0);
    startTimeRef.current = 0;
    totalPausedDurationRef.current = 0;
    pauseStartTimeRef.current = 0;
    locationRef.current = null;
    allSamplesRef.current = [];
    analyzerRef.current.reset();
    pitchHistoryRef.current = [];
    amplitudeHistoryRef.current = [];
    energyHistoryRef.current = [];
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
