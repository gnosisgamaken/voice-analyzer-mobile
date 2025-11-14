import { useState, useCallback, useRef, useEffect } from 'react';
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
  
  const playerRef = useRef<any>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const stopPositionUpdates = useCallback(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  }, []);

  const startPositionUpdates = useCallback(() => {
    stopPositionUpdates();

    updateIntervalRef.current = setInterval(async () => {
      if (!isMountedRef.current || !playerRef.current) {
        stopPositionUpdates();
        return;
      }

      try {
        if (Platform.OS === 'web') {
          return;
        }

        const status = await playerRef.current.getStatusAsync();
        
        if (!isMountedRef.current) return;

        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setDuration(status.durationMillis || 0);
          
          if (status.didJustFinish) {
            setPlaybackState('stopped');
            setPosition(0);
            stopPositionUpdates();
          }
        }
      } catch (error) {
        console.error('Error updating playback position:', error);
        if (isMountedRef.current) {
          stopPositionUpdates();
        }
      }
    }, 100);
  }, [stopPositionUpdates]);

  const loadAudio = useCallback(async (uri: string) => {
    if (Platform.OS === 'web') {
      setPlaybackState('error');
      setIsLoaded(false);
      return;
    }

    try {
      setPlaybackState('loading');
      
      stopPositionUpdates();
      
      if (playerRef.current) {
        try {
          await playerRef.current.unloadAsync();
        } catch (e) {
          console.warn('Error unloading previous player:', e);
        }
        playerRef.current = null;
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false }
      );
      
      if (!isMountedRef.current) {
        await sound.unloadAsync();
        return;
      }

      playerRef.current = sound;
      
      if (!isMountedRef.current) {
        await sound.unloadAsync();
        return;
      }

      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
        setIsLoaded(true);
        setPlaybackState('stopped');
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      if (isMountedRef.current) {
        setPlaybackState('error');
        setIsLoaded(false);
      }
    }
  }, [stopPositionUpdates]);

  const unloadAudio = useCallback(async () => {
    try {
      stopPositionUpdates();
      
      if (playerRef.current) {
        try {
          await playerRef.current.unloadAsync();
        } catch (e) {
          console.warn('Error unloading player:', e);
        }
        playerRef.current = null;
      }
      
      if (isMountedRef.current) {
        setIsLoaded(false);
        setPlaybackState('idle');
        setPosition(0);
        setDuration(0);
      }
    } catch (error) {
      console.error('Error unloading audio:', error);
    }
  }, [stopPositionUpdates]);

  const play = useCallback(async () => {
    if (Platform.OS === 'web' || !playerRef.current || !isLoaded) {
      console.warn('Cannot play: audio not loaded');
      return;
    }

    try {
      const status = await playerRef.current.getStatusAsync();
      
      if (status.isLoaded) {
        if (status.positionMillis >= (status.durationMillis || 0) - 100) {
          await playerRef.current.setPositionAsync(0);
        }
      }

      await playerRef.current.playAsync();
      
      if (isMountedRef.current) {
        setPlaybackState('playing');
        startPositionUpdates();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      if (isMountedRef.current) {
        setPlaybackState('error');
      }
    }
  }, [isLoaded, startPositionUpdates]);

  const pause = useCallback(async () => {
    if (Platform.OS === 'web' || !playerRef.current || !isLoaded) {
      return;
    }

    try {
      await playerRef.current.pauseAsync();
      stopPositionUpdates();
      
      if (isMountedRef.current) {
        setPlaybackState('paused');
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  }, [isLoaded, stopPositionUpdates]);

  const stop = useCallback(async () => {
    if (Platform.OS === 'web' || !playerRef.current || !isLoaded) {
      return;
    }

    try {
      await playerRef.current.stopAsync();
      await playerRef.current.setPositionAsync(0);
      stopPositionUpdates();
      
      if (isMountedRef.current) {
        setPlaybackState('stopped');
        setPosition(0);
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }, [isLoaded, stopPositionUpdates]);

  const seek = useCallback(async (positionMs: number) => {
    if (Platform.OS === 'web' || !playerRef.current || !isLoaded) {
      return;
    }

    try {
      await playerRef.current.setPositionAsync(positionMs);
      if (isMountedRef.current) {
        setPosition(positionMs);
      }
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  }, [isLoaded]);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      stopPositionUpdates();
      
      if (playerRef.current) {
        playerRef.current.unloadAsync().catch((e: any) => {
          console.warn('Error unloading on unmount:', e);
        });
        playerRef.current = null;
      }
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
