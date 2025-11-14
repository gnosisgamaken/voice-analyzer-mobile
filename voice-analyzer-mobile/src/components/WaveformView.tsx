import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, RoundedRect } from '@shopify/react-native-skia';
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
      const x = index * (barWidth + BAR_GAP);
      const y = (height - barHeight) / 2;

      return {
        x,
        y,
        width: barWidth,
        height: Math.max(barHeight, 4),
        color,
      };
    });
  }, [displaySamples, barWidth, height]);

  return (
    <View style={[styles.container, { height }]}>
      <Canvas style={{ width, height }}>
        {bars.map((bar, index) => (
          <RoundedRect
            key={index}
            x={bar.x + 16}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            r={barWidth / 2}
            color={bar.color}
          />
        ))}
      </Canvas>
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
});
