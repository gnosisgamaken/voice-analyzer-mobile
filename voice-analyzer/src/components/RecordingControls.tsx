import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { RecordingState } from '../types';

interface RecordingControlsProps {
  recordingState: RecordingState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function RecordingControls({
  recordingState,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
}: RecordingControlsProps) {
  return (
    <View style={styles.container}>
      {recordingState === 'idle' && (
        <TouchableOpacity style={[styles.button, styles.recordButton]} onPress={onStart}>
          <Text style={styles.buttonText}>Start Recording</Text>
        </TouchableOpacity>
      )}

      {recordingState === 'recording' && (
        <View style={styles.row}>
          <TouchableOpacity style={[styles.button, styles.pauseButton]} onPress={onPause}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={onStop}>
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        </View>
      )}

      {recordingState === 'paused' && (
        <View style={styles.row}>
          <TouchableOpacity style={[styles.button, styles.recordButton]} onPress={onResume}>
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={onStop}>
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        </View>
      )}

      {recordingState === 'stopped' && (
        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={onReset}>
          <Text style={styles.buttonText}>New Recording</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordButton: {
    backgroundColor: '#ff4444',
  },
  pauseButton: {
    backgroundColor: '#ff9800',
  },
  stopButton: {
    backgroundColor: '#666',
  },
  resetButton: {
    backgroundColor: '#2196f3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
