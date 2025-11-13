import { useState, useRef, useCallback, useEffect } from 'react';
import type { VoiceSample, RecordingState } from '../types';
import { rms, rmsToDb, dbToNormalized, autoCorrelatePitch } from '../utils/audioAnalysis';
import { recordingsDB, type StoredRecording } from '../utils/storage';
import { getCurrentLocation, generateRecordingName } from '../utils/location';

const FFT_SIZE = 2048;
const ANALYSIS_INTERVAL = 50;

export function useAudioRecorder() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [samples, setSamples] = useState<VoiceSample[]>([]);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const startTimeRef = useRef<number>(0);
  const totalPausedTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);
  const analysisIntervalRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const samplesRef = useRef<VoiceSample[]>([]);
  const audioUrlRef = useRef<string | null>(null);

  const startAnalysis = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);
    const sampleRate = audioContextRef.current?.sampleRate || 48000;

    const analyze = () => {
      if (!analyserRef.current) return;

      analyser.getFloatTimeDomainData(dataArray);

      const currentTime = Date.now() - startTimeRef.current - totalPausedTimeRef.current;
      setDuration(currentTime);

      const rmsValue = rms(dataArray);
      const db = rmsToDb(rmsValue);
      const amplitude = dbToNormalized(db);
      const pitchHz = autoCorrelatePitch(dataArray, sampleRate);

      const newSample: VoiceSample = {
        timestamp: currentTime,
        amplitude,
        pitchHz,
      };

      setSamples(prev => {
        const updated = [...prev, newSample];
        samplesRef.current = updated;
        return updated;
      });
    };

    analysisIntervalRef.current = window.setInterval(analyze, ANALYSIS_INTERVAL);
  }, []);

  const stopAnalysis = useCallback(() => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      mediaStreamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 48000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      source.connect(analyser);

      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        audioUrlRef.current = url;
        setAudioUrl(url);
        
        const locationName = await getCurrentLocation();
        const recordingName = generateRecordingName(locationName);
        
        const recording: StoredRecording = {
          id: crypto.randomUUID(),
          name: recordingName,
          locationName,
          timestamp: startTimeRef.current,
          duration: Date.now() - startTimeRef.current - totalPausedTimeRef.current,
          audioBlob,
          samples: samplesRef.current.map(s => ({
            timestamp: s.timestamp,
            amplitude: s.amplitude,
            pitchHz: s.pitchHz,
          })),
        };
        
        try {
          await recordingsDB.saveRecording(recording);
        } catch (error) {
          console.error('Failed to save recording:', error);
        }
      };

      mediaRecorder.start();
      startTimeRef.current = Date.now();
      totalPausedTimeRef.current = 0;
      pauseStartRef.current = 0;
      setRecordingState('recording');
      setSamples([]);
      setDuration(0);
      
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
      setAudioUrl(null);

      startAnalysis();
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Microphone access denied. Please allow microphone permissions.');
    }
  }, [startAnalysis]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      stopAnalysis();
      pauseStartRef.current = Date.now();
      setRecordingState('paused');
    }
  }, [recordingState, stopAnalysis]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      totalPausedTimeRef.current += Date.now() - pauseStartRef.current;
      startAnalysis();
      setRecordingState('recording');
    }
  }, [recordingState, startAnalysis]);

  const stopRecording = useCallback(() => {
    stopAnalysis();

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setRecordingState('stopped');
  }, [stopAnalysis]);

  const reset = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setSamples([]);
    setDuration(0);
    setAudioUrl(null);
    setRecordingState('idle');
    audioChunksRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      stopAnalysis();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [stopAnalysis]);

  return {
    recordingState,
    samples,
    duration,
    audioUrl,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    reset,
  };
}
