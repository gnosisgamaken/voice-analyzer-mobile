import React, { PropsWithChildren } from 'react';
import { View, StyleSheet, ViewStyle, Platform, ColorValue } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useReduceTransparency } from '../hooks/useAccessibilitySettings';
import { COLORS, RADII } from '../constants';

type MaterialVariant = 'thin' | 'regular' | 'ultra';

import type { StyleProp } from 'react-native';

interface MaterialCardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  variant?: MaterialVariant;
  tint?: ColorValue;
}

const BLUR_CONFIG: Record<MaterialVariant, { amount: number; type: 'light' | 'default' }> = {
  thin: { amount: 16, type: Platform.OS === 'ios' ? 'light' : 'default' },
  regular: { amount: 22, type: Platform.OS === 'ios' ? 'light' : 'default' },
  ultra: { amount: 28, type: Platform.OS === 'ios' ? 'light' : 'default' },
};

export function MaterialCard({
  children,
  style,
  contentStyle,
  variant = 'thin',
  tint = COLORS.surface,
}: MaterialCardProps) {
  const reduceTransparency = useReduceTransparency();
  const blurConfig = BLUR_CONFIG[variant];

  return (
    <View style={[styles.base, style]}>
      {reduceTransparency ? (
        <View style={[styles.opaque, { backgroundColor: tint }]} />
      ) : (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurAmount={blurConfig.amount}
          blurType={blurConfig.type}
          reducedTransparencyFallbackColor={tint as string}
        />
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADII.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  opaque: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.92,
  },
  content: {
    position: 'relative',
    padding: 16,
  },
});

export default MaterialCard;
