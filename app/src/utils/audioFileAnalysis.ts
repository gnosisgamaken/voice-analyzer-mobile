import { Buffer } from 'buffer';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import type { VoiceSample, VoiceMetrics, SpectrumFrame } from '../types';
import type { BrandedMetrics, AdvancedVoiceFeatures } from './VoiceMetricsEngine';
import { VoiceAnalyzer, calculateVoiceMetrics, calculateBrandedVoiceMetrics } from './enhancedAudioAnalysis';
import { autoCorrelatePitch } from './audioAnalysis';
import { analyzeVoiceHealth } from './voiceHealthMetrics';
import { analyzeFluency } from './speechFluency';
import { AUDIO_CONFIG } from '../constants';
import { computeAverageVoiceMetrics, computeAverageBrandedMetrics } from './metricsAggregation';
import { logger } from './logger';

const WINDOW_SIZE = AUDIO_CONFIG.fftSize;
const HOP_SIZE = Math.floor(WINDOW_SIZE / 2);
const MAX_SPECTRUM_FRAMES = 160;
const SPECTRUM_BANDS = 24;
const WAVEFORM_POINTS = 200;

interface DecodedWav {
  sampleRate: number;
  samples: Float32Array;
}

export interface RecordingAnalysisResult {
  samples: VoiceSample[];
  averageMetrics: VoiceMetrics;
  averageBrandedMetrics?: BrandedMetrics | null;
  waveform: number[];
  spectrum: SpectrumFrame[];
}

const stripFileScheme = (uri: string): string =>
  uri.startsWith('file://') ? uri.replace('file://', '') : uri;

export async function analyzeRecordingFile(uri: string): Promise<RecordingAnalysisResult | null> {
  try {
    if (Platform.OS === 'android') {
      logger.warn('Android audio analysis skipped - AAC format not supported. iOS required for full analysis.');
      return null;
    }

    let decoded: { sampleRate: number; samples: Float32Array };
    try {
      decoded = await decodeWavFile(stripFileScheme(uri));
    } catch (decodeError) {
      logger.error('Failed to decode WAV file:', decodeError);
      return null;
    }

    const { sampleRate, samples } = decoded;
    if (!samples.length) {
      return null;
    }

    const analyzer = new VoiceAnalyzer(sampleRate, WINDOW_SIZE);
    const voiceSamples: VoiceSample[] = [];
    const spectrum: SpectrumFrame[] = [];
    const pitchHistory: number[] = [];
    const amplitudeHistory: number[] = [];
    const energyHistory: number[] = [];

    const totalFrames = Math.max(
      1,
      Math.floor(Math.max(0, samples.length - WINDOW_SIZE) / HOP_SIZE),
    );
    const spectrumStep = Math.max(1, Math.floor(totalFrames / MAX_SPECTRUM_FRAMES));

    let frameIndex = 0;
    for (let start = 0; start + WINDOW_SIZE <= samples.length; start += HOP_SIZE) {
      const frame = samples.subarray(start, start + WINDOW_SIZE);
      const features = analyzer.extractFeatures(frame);
      const pitchHz = autoCorrelatePitch(frame, sampleRate);

      pitchHistory.push(pitchHz ?? 0);
      amplitudeHistory.push(features.rms);
      energyHistory.push(features.energy);

      if (pitchHistory.length > 400) pitchHistory.shift();
      if (amplitudeHistory.length > 400) amplitudeHistory.shift();
      if (energyHistory.length > 400) energyHistory.shift();

      const voiceHealth = analyzeVoiceHealth({
        pitchHzHistory: pitchHistory.filter((hz) => hz > 0),
        amplitudeHistory,
      });

      const fluency = analyzeFluency(energyHistory, AUDIO_CONFIG.analysisInterval);
      const pitchValues = pitchHistory.filter((hz) => hz > 0);
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
          energyHistory.length > 1
            ? Math.min(
                1,
                Math.sqrt(
                  energyHistory.reduce(
                    (sum, energy) => sum + Math.pow(energy - features.energy, 2),
                    0,
                  ) / energyHistory.length,
                ),
              )
            : undefined,
      };

      const voiceMetrics = calculateVoiceMetrics(features);
      const brandedMetrics = calculateBrandedVoiceMetrics(features, advancedFeatures);

      voiceSamples.push({
        timestamp: (start / sampleRate) * 1000,
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
        voiceMetrics,
        brandedMetrics,
      });

      if (frameIndex % spectrumStep === 0) {
        spectrum.push({
          time: (start / sampleRate) * 1000,
          bands: analyzer.getSpectrumBands(SPECTRUM_BANDS),
        });
      }

      frameIndex++;
    }

    const waveform = buildWaveform(samples);
    const averageMetrics = computeAverageVoiceMetrics(voiceSamples);
    const averageBrandedMetrics = computeAverageBrandedMetrics(voiceSamples);

    return {
      samples: voiceSamples,
      averageMetrics,
      averageBrandedMetrics,
      waveform,
      spectrum,
    };
  } catch (error) {
    logger.error('Failed to analyze recording file:', error);
    return null;
  }
}

async function decodeWavFile(path: string): Promise<DecodedWav> {
  const base64 = await RNFS.readFile(path, 'base64');
  const buffer = Buffer.from(base64, 'base64');

  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('Unsupported audio format. Please record as WAV/PCM.');
  }

  const fmtOffset = buffer.indexOf('fmt ');
  if (fmtOffset < 0) {
    throw new Error('Invalid WAV: missing fmt chunk');
  }

  const audioFormat = buffer.readUInt16LE(fmtOffset + 8);
  if (audioFormat !== 1) {
    throw new Error('Only PCM WAV files are supported');
  }

  const channels = buffer.readUInt16LE(fmtOffset + 10);
  if (channels !== 1) {
    throw new Error('Only mono recordings are supported at the moment');
  }

  const sampleRate = buffer.readUInt32LE(fmtOffset + 12);
  const bitsPerSample = buffer.readUInt16LE(fmtOffset + 22);
  const bytesPerSample = bitsPerSample / 8;

  const dataOffset = buffer.indexOf('data');
  if (dataOffset < 0) {
    throw new Error('Invalid WAV: missing data chunk');
  }

  const dataSize = buffer.readUInt32LE(dataOffset + 4);
  const start = dataOffset + 8;
  const sampleCount = Math.floor(dataSize / bytesPerSample);
  const samples = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const sample = buffer.readInt16LE(start + i * bytesPerSample);
    samples[i] = sample / 32768;
  }

  return { sampleRate, samples };
}

function buildWaveform(samples: Float32Array): number[] {
  if (!samples.length) {
    return [];
  }

  const step = Math.max(1, Math.floor(samples.length / WAVEFORM_POINTS));
  const waveform: number[] = [];

  for (let i = 0; i < samples.length; i += step) {
    let peak = 0;
    for (let j = i; j < i + step && j < samples.length; j++) {
      peak = Math.max(peak, Math.abs(samples[j]));
    }
    waveform.push(peak);
  }

  const max = Math.max(...waveform, 1);
  return waveform.map((value) => value / max);
}
