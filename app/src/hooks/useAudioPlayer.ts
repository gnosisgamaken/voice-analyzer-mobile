import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { logger } from '../utils/logger';

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error';

interface UseAudioPlayerReturn {
  playbackState: PlaybackState;
  position: number;
  duration: number;
  isLoaded: boolean;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  loadAudio: (uri: string, expectedDuration?: number) => Promise<void>;
  unloadAudio: () => Promise<void>;
}

const stripFileScheme = (uri: string): string => {
  if (Platform.OS === 'android') {
    return uri.replace('file://', '');
  }
  return uri;
};

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const playerRef = useRef<AudioRecorderPlayer | null>(null);
  const loadedUriRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);
  const listenerActiveRef = useRef(false);

  const getPlayer = (): AudioRecorderPlayer => {
    if (!playerRef.current) {
      playerRef.current = new AudioRecorderPlayer();
    }
    return playerRef.current;
  };

  const stopProgressUpdates = useCallback(() => {
    if (playerRef.current && listenerActiveRef.current) {
      playerRef.current.removePlayBackListener();
      listenerActiveRef.current = false;
    }
  }, []);

  const startProgressUpdates = useCallback(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const player = getPlayer();
    stopProgressUpdates();
    player.addPlayBackListener((event) => {
      if (!isMountedRef.current) {
        return;
      }

      setPosition(event.currentPosition);
      setDuration(event.duration > 0 ? event.duration : duration);

      if (event.currentPosition >= event.duration && event.duration > 0) {
        stopProgressUpdates();
        setPlaybackState('stopped');
        setPosition(0);
      }
    });
    listenerActiveRef.current = true;
  }, [duration, stopProgressUpdates]);

  const loadAudio = useCallback(async (uri: string, expectedDuration?: number) => {
    if (Platform.OS === 'web') {
      setPlaybackState('error');
      setIsLoaded(false);
      return;
    }

    try {
      logger.debug('Loading audio into player:', uri);
      stopProgressUpdates();
      const player = getPlayer();
      await player.stopPlayer().catch(() => undefined);
      loadedUriRef.current = uri;
      setPlaybackState('stopped');
      setIsLoaded(true);
      setPosition(0);
      if (expectedDuration) {
        setDuration(expectedDuration * 1000);
      } else {
        setDuration(0);
      }
    } catch (error) {
      logger.error('Error loading audio:', error);
      setPlaybackState('error');
      setIsLoaded(false);
    }
  }, [stopProgressUpdates]);

  const unloadAudio = useCallback(async () => {
    try {
      stopProgressUpdates();
      if (playerRef.current) {
        await playerRef.current.stopPlayer().catch(() => undefined);
      }
      loadedUriRef.current = null;
      setIsLoaded(false);
      setPlaybackState('idle');
      setPosition(0);
      setDuration(0);
    } catch (error) {
      logger.error('Error unloading audio:', error);
    }
  }, [stopProgressUpdates]);

  const play = useCallback(async () => {
    if (Platform.OS === 'web' || !loadedUriRef.current || !isLoaded) {
      logger.warn('Cannot play: audio not loaded');
      return;
    }

    try {
      logger.debug('Starting playback for', loadedUriRef.current);
      const player = getPlayer();
      stopProgressUpdates();
      const path = stripFileScheme(loadedUriRef.current);
      await player.startPlayer(path);
      await player.setVolume(1.0);
      setPlaybackState('playing');
      startProgressUpdates();
    } catch (error) {
      logger.error('Error playing audio:', error);
      setPlaybackState('error');
    }
  }, [isLoaded, startProgressUpdates, stopProgressUpdates]);

  const pause = useCallback(async () => {
    if (Platform.OS === 'web' || !playerRef.current || !isLoaded) {
      return;
    }

    try {
      await playerRef.current.pausePlayer();
      stopProgressUpdates();
      setPlaybackState('paused');
      logger.debug('Playback paused at', position);
    } catch (error) {
      logger.error('Error pausing audio:', error);
    }
  }, [isLoaded, position, stopProgressUpdates]);

  const stop = useCallback(async () => {
    if (Platform.OS === 'web' || !playerRef.current || !isLoaded) {
      return;
    }

    try {
      await playerRef.current.stopPlayer();
      stopProgressUpdates();
      setPlaybackState('stopped');
      setPosition(0);
      logger.debug('Playback stopped');
    } catch (error) {
      logger.error('Error stopping audio:', error);
    }
  }, [isLoaded, stopProgressUpdates]);

  const seek = useCallback(async (positionMs: number) => {
    if (Platform.OS === 'web' || !playerRef.current || !isLoaded) {
      return;
    }

    try {
      await playerRef.current.seekToPlayer(positionMs);
      setPosition(positionMs);
      logger.debug('Playback seeked to', positionMs);
    } catch (error) {
      logger.error('Error seeking audio:', error);
    }
  }, [isLoaded]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopProgressUpdates();
      if (playerRef.current) {
        playerRef.current.stopPlayer().catch(() => undefined);
        playerRef.current = null;
      }
    };
  }, [stopProgressUpdates]);

  return {
    playbackState,
    position,
    duration,
    isLoaded,
    play,
    pause,
    stop,
    seek,
    loadAudio,
    unloadAudio,
  };
}
