import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Rect, Group, useCanvasRef } from '@shopify/react-native-skia';
import { VoiceSample } from '../types';
import { pitchToColor } from '../utils/audioAnalysis';

interface WaveformViewProps {
  samples: VoiceSample[];
  width?: number;
  height?: number;
}

export function WaveformView({ samples, width, height }: WaveformViewProps) {
  const canvasWidth = width || Dimensions.get('window').width - 40;
  const canvasHeight = height || 200;

  const visibleSamples = samples.slice(-100);
  const barWidth = canvasWidth / 100;

  return (
    <View style={styles.container}>
      <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
        <Group>
          {visibleSamples.map((sample, index) => {
            const x = index * barWidth;
            const normalizedHeight = Math.max(0.02, sample.amplitude);
            const barHeight = normalizedHeight * canvasHeight * 0.8;
            const y = (canvasHeight - barHeight) / 2;
            const color = pitchToColor(sample.pitchHz);

            return (
              <Rect
                key={`${sample.timestamp}-${index}`}
                x={x}
                y={y}
                width={barWidth - 1}
                height={Math.max(2, barHeight)}
                color={color}
              />
            );
          })}
        </Group>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
});
