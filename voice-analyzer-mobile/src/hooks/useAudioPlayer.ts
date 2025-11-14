import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

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
  loadAudio: (uri: string) => Promise<void>;
  unloadAudio: () => Promise<void>;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startPositionUpdates = useCallback(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }

    updateIntervalRef.current = setInterval(async () => {
      if (soundRef.current) {
        try {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);
            
            if (status.didJustFinish) {
              setPlaybackState('stopped');
              setPosition(0);
              if (updateIntervalRef.current) {
                clearInterval(updateIntervalRef.current);
                updateIntervalRef.current = null;
              }
            }
          }
        } catch (error) {
          console.error('Error updating playback position:', error);
        }
      }
    }, 100);
  }, []);

  const stopPositionUpdates = useCallback(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  }, []);

  const loadAudio = useCallback(async (uri: string) => {
    try {
      setPlaybackState('loading');
      
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false }
      );

      soundRef.current = sound;
      
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
        setIsLoaded(true);
        setPlaybackState('stopped');
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      setPlaybackState('error');
      setIsLoaded(false);
    }
  }, []);

  const unloadAudio = useCallback(async () => {
    try {
      stopPositionUpdates();
      
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      
      setIsLoaded(false);
      setPlaybackState('idle');
      setPosition(0);
      setDuration(0);
    } catch (error) {
      console.error('Error unloading audio:', error);
    }
  }, [stopPositionUpdates]);

  const play = useCallback(async () => {
    if (!soundRef.current || !isLoaded) {
      console.warn('Cannot play: audio not loaded');
      return;
    }

    try {
      const status = await soundRef.current.getStatusAsync();
      
      if (status.isLoaded) {
        if (status.positionMillis >= (status.durationMillis || 0) - 100) {
          await soundRef.current.setPositionAsync(0);
        }
      }

      await soundRef.current.playAsync();
      setPlaybackState('playing');
      startPositionUpdates();
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlaybackState('error');
    }
  }, [isLoaded, startPositionUpdates]);

  const pause = useCallback(async () => {
    if (!soundRef.current || !isLoaded) {
      return;
    }

    try {
      await soundRef.current.pauseAsync();
      setPlaybackState('paused');
      stopPositionUpdates();
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  }, [isLoaded, stopPositionUpdates]);

  const stop = useCallback(async () => {
    if (!soundRef.current || !isLoaded) {
      return;
    }

    try {
      await soundRef.current.stopAsync();
      await soundRef.current.setPositionAsync(0);
      setPlaybackState('stopped');
      setPosition(0);
      stopPositionUpdates();
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }, [isLoaded, stopPositionUpdates]);

  const seek = useCallback(async (positionMs: number) => {
    if (!soundRef.current || !isLoaded) {
      return;
    }

    try {
      await soundRef.current.setPositionAsync(positionMs);
      setPosition(positionMs);
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  }, [isLoaded]);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      stopPositionUpdates();
    };
  }, [stopPositionUpdates]);

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
