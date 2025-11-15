import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { pitchToColor } from '../utils/pitchToColor';
import { AUDIO_CONFIG } from '../constants';

interface WaveformViewProps {
  samples: Array<{ pitchHz: number | null; amplitude: number }>;
  height?: number;
}

const WINDOW_SIZE = AUDIO_CONFIG.waveformWindowSize;
const BAR_GAP = AUDIO_CONFIG.waveformBarGap;

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
      <View style={styles.canvas}>
        {bars.map((bar, index) => (
          <View
            key={index}
            style={{
              position: 'absolute',
              left: bar.x + 16,
              top: bar.y,
              width: bar.width,
              height: bar.height,
              backgroundColor: bar.color,
              borderRadius: barWidth / 2,
            }}
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
  canvas: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
});
