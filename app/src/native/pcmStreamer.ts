import { NativeEventEmitter, NativeModules, Platform, type EmitterSubscription } from 'react-native';
import { Buffer } from 'buffer';
import { logger } from '../utils/logger';

const MODULE_NAME = 'VoicePCMStreamer';
const EVENT_NAME = 'onAudioPCM';
const PCM_BYTES_PER_SAMPLE = 4; // Float32

type PCMStreamerModule = {
  startStreaming(options?: PCMStreamingOptions): Promise<unknown>;
  stopStreaming(): Promise<unknown>;
};

export type PCMStreamingOptions = {
  sampleRate?: number;
  frameSize?: number;
};

export type PCMFramePayload = {
  samples?: number[];
  channelData?: number[];
  sampleRate?: number;
  chunk?: string;
  pcmData?: string;
  frameSamples?: number;
};

export type PCMFrameListener = (frame: { samples: Float32Array; sampleRate: number }) => void;

const nativeModule: PCMStreamerModule | undefined =
  Platform.OS === 'web' ? undefined : (NativeModules[MODULE_NAME] as PCMStreamerModule | undefined);

export const isPCMStreamingSupported = (): boolean => {
  return !!nativeModule?.startStreaming;
};

const decodeChunk = (chunk: string): Float32Array | null => {
  try {
    const buffer = Buffer.from(chunk, 'base64');
    const sampleCount = Math.floor(buffer.length / PCM_BYTES_PER_SAMPLE);
    if (!sampleCount) {
      return null;
    }

    const samples = new Float32Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      samples[i] = buffer.readFloatLE(i * PCM_BYTES_PER_SAMPLE);
    }
    return samples;
  } catch (error) {
    logger.warn('Failed to decode PCM chunk', error);
    return null;
  }
};

const toFloatArray = (payload: PCMFramePayload): Float32Array | null => {
  if (typeof payload.pcmData === 'string' && payload.pcmData.length > 0) {
    return decodeChunk(payload.pcmData);
  }
  if (typeof payload.chunk === 'string' && payload.chunk.length > 0) {
    return decodeChunk(payload.chunk);
  }

  const source = payload.samples ?? payload.channelData;
  if (!Array.isArray(source) || !source.length) {
    return null;
  }
  return Float32Array.from(source);
};

export async function startPCMStreaming(
  listener: PCMFrameListener,
  options?: PCMStreamingOptions,
): Promise<(() => Promise<void> | void) | null> {
  if (!isPCMStreamingSupported()) {
    logger.debug('PCM streaming module not available – falling back to file polling');
    return null;
  }

  const emitter = new NativeEventEmitter(nativeModule as any);
  let subscription: EmitterSubscription | null = null;

  const safeListener = (payload: PCMFramePayload) => {
    const samples = toFloatArray(payload);
    if (!samples) {
      return;
    }
    const sampleRate = payload.sampleRate ?? options?.sampleRate ?? 44100;
    listener({ samples, sampleRate });
  };

  subscription = emitter.addListener(EVENT_NAME, safeListener);

  try {
    await nativeModule!.startStreaming(options);
  } catch (error) {
    subscription.remove();
    logger.warn('Unable to start PCM streaming module, falling back:', error);
    throw error;
  }

  return async () => {
    if (subscription) {
      subscription.remove();
      subscription = null;
    }
    try {
      await nativeModule!.stopStreaming();
    } catch (error) {
      logger.warn('Failed to stop PCM streaming cleanly:', error);
    }
  };
}
