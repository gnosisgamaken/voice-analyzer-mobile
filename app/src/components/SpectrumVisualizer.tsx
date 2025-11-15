import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { SpectrumFrame } from '../types';

interface SpectrumVisualizerProps {
  frames?: SpectrumFrame[];
  waveform?: number[];
  currentTimeMs?: number;
  onSeek?: (positionMs: number) => void;
}

const COLOR_STOPS = [
  { r: 14, g: 165, b: 233 },
  { r: 79, g: 70, b: 229 },
  { r: 168, g: 85, b: 247 },
  { r: 236, g: 72, b: 153 },
  { r: 249, g: 115, b: 22 },
  { r: 250, g: 204, b: 21 },
];

export function SpectrumVisualizer({
  frames = [],
  waveform = [],
  currentTimeMs = 0,
  onSeek,
}: SpectrumVisualizerProps) {
  if (!frames.length) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Record your voice to unlock spectrum insights.</Text>
      </View>
    );
  }

  const frameWindow = useMemo(() => {
    if (frames.length < 2) {
      return 0;
    }
    return (frames[1].time ?? 0) - (frames[0].time ?? 0);
  }, [frames]);

  const normalizedWaveform = useMemo(() => {
    if (!waveform.length) {
      return [];
    }
    const max = Math.max(...waveform, 1);
    return waveform.map((value) => value / max);
  }, [waveform]);

  return (
    <View>
      {normalizedWaveform.length > 0 && (
        <View style={styles.waveformRow}>
          {normalizedWaveform.map((value, index) => (
            <View
              key={`wave-${index}`}
              style={[
                styles.waveformBar,
                {
                  height: 8 + value * 32,
                  opacity: 0.3 + value * 0.7,
                },
              ]}
            />
          ))}
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.spectrumRow}
      >
        {frames.map((frame, index) => {
          const isActive =
            currentTimeMs >= frame.time &&
            (frameWindow === 0 || currentTimeMs < frame.time + frameWindow);
          return (
            <TouchableOpacity
              key={`frame-${index}-${frame.time}`}
              onPress={() => onSeek?.(frame.time)}
              activeOpacity={0.7}
              style={styles.columnWrapper}
            >
              <View style={[styles.spectrumColumn, isActive && styles.activeColumn]}>
                {frame.bands.map((band, bandIndex) => (
                  <View
                    key={`band-${index}-${bandIndex}`}
                    style={[
                      styles.bandBlock,
                      {
                        backgroundColor: bandColor(bandIndex, frame.bands.length, band),
                      },
                    ]}
                  />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function bandColor(index: number, total: number, intensity: number): string {
  const stopIndex = Math.min(
    COLOR_STOPS.length - 1,
    Math.floor((index / Math.max(total - 1, 1)) * (COLOR_STOPS.length - 1)),
  );
  const stop = COLOR_STOPS[stopIndex];
  const alpha = 0.2 + Math.min(Math.max(intensity, 0), 1) * 0.8;
  return `rgba(${stop.r}, ${stop.g}, ${stop.b}, ${alpha})`;
}

const styles = StyleSheet.create({
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  waveformRow: {
    flexDirection: 'row',
    height: 48,
    alignItems: 'flex-end',
    marginBottom: 12,
    overflow: 'hidden',
  },
  waveformBar: {
    width: 2,
    backgroundColor: '#007AFF',
    marginRight: 1,
    borderRadius: 1,
  },
  spectrumRow: {
    paddingBottom: 4,
  },
  columnWrapper: {
    marginRight: 2,
  },
  spectrumColumn: {
    flexDirection: 'column-reverse',
    width: 14,
    height: 120,
    borderRadius: 6,
    overflow: 'hidden',
  },
  activeColumn: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  bandBlock: {
    height: 5,
  },
});

export default SpectrumVisualizer;
