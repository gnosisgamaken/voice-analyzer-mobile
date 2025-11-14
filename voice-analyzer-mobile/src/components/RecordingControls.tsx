import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { RecordingState } from '../types';

interface RecordingControlsProps {
  recordingState: RecordingState;
  duration: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export default function RecordingControls({
  recordingState,
  duration,
  onStart,
  onPause,
  onResume,
  onStop,
}: RecordingControlsProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart();
  };

  const handlePause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPause();
  };

  const handleResume = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onResume();
  };

  const handleStop = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onStop();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{formatTime(duration)}</Text>
      
      <View style={styles.controls}>
        {recordingState === 'idle' && (
          <TouchableOpacity
            style={[styles.button, styles.recordButton]}
            onPress={handleStart}
          >
            <View style={styles.recordDot} />
          </TouchableOpacity>
        )}

        {recordingState === 'recording' && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handlePause}
            >
              <View style={styles.pauseIcon}>
                <View style={styles.pauseBar} />
                <View style={styles.pauseBar} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={handleStop}
            >
              <View style={styles.stopSquare} />
            </TouchableOpacity>
          </>
        )}

        {recordingState === 'paused' && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.recordButton]}
              onPress={handleResume}
            >
              <View style={styles.playIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={handleStop}
            >
              <View style={styles.stopSquare} />
            </TouchableOpacity>
          </>
        )}

        {recordingState === 'stopped' && (
          <TouchableOpacity
            style={[styles.button, styles.recordButton]}
            onPress={handleStart}
          >
            <View style={styles.recordDot} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, recordingState === 'recording' && styles.recording]} />
        <Text style={styles.statusText}>
          {recordingState === 'idle' && 'Ready to record'}
          {recordingState === 'recording' && 'Recording...'}
          {recordingState === 'paused' && 'Paused'}
          {recordingState === 'stopped' && 'Stopped'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 24,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordButton: {
    backgroundColor: '#FF3B30',
  },
  secondaryButton: {
    backgroundColor: '#007AFF',
  },
  stopButton: {
    backgroundColor: '#8E8E93',
  },
  recordDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 4,
  },
  pauseBar: {
    width: 4,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  stopSquare: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  playIcon: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: '#FFFFFF',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8E8E93',
  },
  recording: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
