import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import Slider from '@react-native-community/slider';
import { PlaybackState } from '../hooks/useAudioPlayer';
import { formatDuration } from '../utils/formatting';
import { triggerHaptic } from '../utils/haptics';

interface PlaybackControlsProps {
  playbackState: PlaybackState;
  position: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (position: number) => void;
}

export default function PlaybackControls({
  playbackState,
  position,
  duration,
  onPlay,
  onPause,
  onStop,
  onSeek,
}: PlaybackControlsProps) {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  const displayPosition = isSeeking ? seekPosition : position;

  useEffect(() => {
    if (!isSeeking) {
      setSeekPosition(position);
    }
  }, [position, isSeeking]);

  const handlePlayPause = async () => {
    triggerHaptic('impactMedium' as HapticFeedbackTypes);
    if (playbackState === 'playing') {
      onPause();
    } else {
      onPlay();
    }
  };

  const handleStop = async () => {
    triggerHaptic('impactMedium' as HapticFeedbackTypes);
    onStop();
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekChange = (value: number) => {
    setSeekPosition(value);
  };

  const handleSeekComplete = (value: number) => {
    setIsSeeking(false);
    onSeek(value);
  };

  const isPlaying = playbackState === 'playing';
  const isLoading = playbackState === 'loading';
  const canControl = playbackState !== 'idle' && playbackState !== 'loading' && playbackState !== 'error';

  return (
    <View style={styles.container}>
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatDuration(displayPosition)}</Text>
        <Text style={styles.timeText}>{formatDuration(duration)}</Text>
      </View>

      <Slider
        style={styles.slider}
        value={displayPosition}
        minimumValue={0}
        maximumValue={duration || 1}
        onSlidingStart={handleSeekStart}
        onValueChange={handleSeekChange}
        onSlidingComplete={handleSeekComplete}
        minimumTrackTintColor="#007AFF"
        maximumTrackTintColor="#C7C7CC"
        thumbTintColor="#007AFF"
        disabled={!canControl}
      />

      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.button, styles.stopButton, !canControl && styles.buttonDisabled]}
          onPress={handleStop}
          disabled={!canControl}
        >
          <Text style={styles.stopIcon}>■</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.playButton, !canControl && styles.buttonDisabled]}
          onPress={handlePlayPause}
          disabled={!canControl}
        >
          {isLoading ? (
            <Text style={styles.playIcon}>⋯</Text>
          ) : isPlaying ? (
            <Text style={styles.playIcon}>❚❚</Text>
          ) : (
            <Text style={styles.playIcon}>▶</Text>
          )}
        </TouchableOpacity>
      </View>

      {playbackState === 'error' && (
        <Text style={styles.errorText}>Failed to load audio</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 16,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: 8,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playButton: {
    backgroundColor: '#007AFF',
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    backgroundColor: '#C7C7CC',
    opacity: 0.5,
  },
  playIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  stopIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 8,
  },
});
