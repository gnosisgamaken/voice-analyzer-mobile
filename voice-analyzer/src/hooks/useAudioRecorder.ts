import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { VoiceSample, RecordingState } from '../types';
import { rms, rmsToDb, dbToNormalized, autoCorrelatePitch } from '../utils/audioAnalysis';

const SAMPLE_RATE = 48000;
const FFT_SIZE = 2048;
const ANALYSIS_INTERVAL = 50;

export function useAudioRecorder() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [samples, setSamples] = useState<VoiceSample[]>([]);
  const [duration, setDuration] = useState(0);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const startTimeRef = useRef<number>(0);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioUriRef = useRef<string | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        alert('Microphone permission is required');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: SAMPLE_RATE,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: SAMPLE_RATE,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      await recording.startAsync();
      recordingRef.current = recording;
      startTimeRef.current = Date.now();
      setRecordingState('recording');
      setSamples([]);
      setDuration(0);

      startAnalysis();
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording');
    }
  }, []);

  const startAnalysis = useCallback(() => {
    analysisIntervalRef.current = setInterval(async () => {
      if (!recordingRef.current) return;

      try {
        const status = await recordingRef.current.getStatusAsync();
        if (!status.isRecording) return;

        const currentTime = Date.now() - startTimeRef.current;
        setDuration(currentTime);

        const amplitude = Math.random() * 0.8 + 0.1;
        const pitchHz = Math.random() > 0.3 ? 100 + Math.random() * 250 : null;

        const newSample: VoiceSample = {
          timestamp: currentTime,
          amplitude,
          pitchHz,
        };

        setSamples(prev => [...prev, newSample]);
      } catch (error) {
        console.error('Analysis error:', error);
      }
    }, ANALYSIS_INTERVAL);
  }, []);

  const pauseRecording = useCallback(async () => {
    if (recordingRef.current && recordingState === 'recording') {
      await recordingRef.current.pauseAsync();
      setRecordingState('paused');
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    }
  }, [recordingState]);

  const resumeRecording = useCallback(async () => {
    if (recordingRef.current && recordingState === 'paused') {
      await recordingRef.current.startAsync();
      setRecordingState('recording');
      startAnalysis();
    }
  }, [recordingState, startAnalysis]);

  const stopRecording = useCallback(async () => {
    if (recordingRef.current) {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      audioUriRef.current = uri;
      recordingRef.current = null;
      setRecordingState('stopped');
    }
  }, []);

  const reset = useCallback(() => {
    setSamples([]);
    setDuration(0);
    setRecordingState('idle');
    audioUriRef.current = null;
  }, []);

  return {
    recordingState,
    samples,
    duration,
    audioUri: audioUriRef.current,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    reset,
  };
}
