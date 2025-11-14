import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { pitchToColor } from '../utils/pitchToColor';

interface WaveformViewProps {
  samples: Array<{ pitchHz: number | null; amplitude: number }>;
  height?: number;
}

const WINDOW_SIZE = 100;
const BAR_GAP = 2;

export default function WaveformView({ samples, height = 200 }: WaveformViewProps) {
  const { width } = Dimensions.get('window');
  const barWidth = (width - 32 - (WINDOW_SIZE - 1) * BAR_GAP) / WINDOW_SIZE;

  const displaySamples = useMemo(() => {
    return samples.slice(-WINDOW_SIZE);
  }, [samples]);

  const bars = useMemo(() => {
    return displaySamples.map((sample, index) => {
      const color = sample.pitchHz !== null 
        ? pitchToColor(sample.pitchHz)
        : 'rgb(156, 163, 175)';
      
      const normalizedAmplitude = Math.min(Math.max(sample.amplitude, 0), 1);
      const barHeight = normalizedAmplitude * height * 0.8;

      return {
        id: index,
        height: Math.max(barHeight, 4),
        color,
      };
    });
  }, [displaySamples, height]);

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.barsContainer}>
        {bars.map((bar) => (
          <View
            key={bar.id}
            style={[
              styles.bar,
              {
                width: barWidth,
                height: bar.height,
                backgroundColor: bar.color,
                borderRadius: barWidth / 2,
                marginHorizontal: BAR_GAP / 2,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingHorizontal: 16,
  },
  bar: {
    alignSelf: 'center',
  },
});
