import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import type { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { RecordingState } from '../types';
import { formatTime } from '../utils/formatting';
import { COLORS, TYPOGRAPHY } from '../constants';
import { triggerHaptic } from '../utils/haptics';

interface RecordingControlsProps {
  recordingState: RecordingState;
  duration: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const CONTROL_COPY: Record<RecordingState, string> = {
  idle: 'Hold steady and speak naturally.',
  recording: 'Analyzing your tone in real time.',
  paused: 'Paused — resume when ready.',
  stopped: 'Session stored. Review insights below.',
};

export default function RecordingControls({
  recordingState,
  duration,
  onStart,
  onPause,
  onResume,
  onStop,
}: RecordingControlsProps) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (recordingState === 'recording') {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.08, duration: 700, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
      );
      animation.start();
    } else {
      pulse.setValue(1);
    }

    return () => animation?.stop();
  }, [pulse, recordingState]);

  const handleStart = async () => {
    triggerHaptic('impactMedium' as HapticFeedbackTypes);
    onStart();
  };

  const handlePause = async () => {
    triggerHaptic('impactLight' as HapticFeedbackTypes);
    onPause();
  };

  const handleResume = async () => {
    triggerHaptic('impactMedium' as HapticFeedbackTypes);
    onResume();
  };

  const handleStop = async () => {
    triggerHaptic('notificationSuccess' as HapticFeedbackTypes);
    onStop();
  };

  const renderRecordButton = () => (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <TouchableOpacity style={[styles.button, styles.recordButton]} onPress={handleStart}>
        <View style={styles.recordDot} />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{formatTime(duration)}</Text>

      <View style={styles.controls}>
        {recordingState === 'idle' && renderRecordButton()}

        {recordingState === 'recording' && (
          <>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handlePause}>
              <View style={styles.pauseIcon}>
                <View style={styles.pauseBar} />
                <View style={styles.pauseBar} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={handleStop}>
              <View style={styles.stopSquare} />
            </TouchableOpacity>
          </>
        )}

        {recordingState === 'paused' && (
          <>
            <TouchableOpacity style={[styles.button, styles.recordButton]} onPress={handleResume}>
              <View style={styles.playIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={handleStop}>
              <View style={styles.stopSquare} />
            </TouchableOpacity>
          </>
        )}

        {recordingState === 'stopped' && renderRecordButton()}
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, recordingState === 'recording' && styles.recording]} />
        <Text style={styles.statusText}>{CONTROL_COPY[recordingState]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.label,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  recordButton: {
    backgroundColor: COLORS.critical,
  },
  secondaryButton: {
    backgroundColor: COLORS.primaryMuted,
  },
  stopButton: {
    backgroundColor: COLORS.primaryMuted,
  },
  recordDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
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
    paddingHorizontal: 24,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondaryLabel,
  },
  recording: {
    backgroundColor: COLORS.critical,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondaryLabel,
    textAlign: 'center',
    flex: 1,
  },
});
