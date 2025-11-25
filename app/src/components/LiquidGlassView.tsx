import React, { PropsWithChildren } from 'react';
import { View, StyleSheet, Platform, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useReduceTransparency } from '../hooks/useReduceTransparency';
import { DesignTokens } from '../design/tokens';

type GlassVariant = 'regular' | 'clear' | 'thin' | 'ultra';

interface LiquidGlassViewProps {
  style?: StyleProp<ViewStyle>;
  contentStyle?: ViewStyle;
  variant?: GlassVariant;
  children?: React.ReactNode;
}

export type { LiquidGlassViewProps };

const BLUR_CONFIG: Record<GlassVariant, { amount: number; lightType: 'light' | 'xlight' | 'regular'; darkType: 'dark' | 'regular' }> = {
  thin: { amount: 16, lightType: 'xlight', darkType: 'dark' },
  regular: { amount: 22, lightType: 'light', darkType: 'dark' },
  ultra: { amount: 28, lightType: 'regular', darkType: 'dark' },
  clear: { amount: 12, lightType: 'xlight', darkType: 'regular' },
};

export function LiquidGlassView({
  children,
  style,
  contentStyle,
  variant = 'regular',
}: LiquidGlassViewProps) {
  const reduceTransparency = useReduceTransparency();

  if (reduceTransparency) {
    return (
      <View style={[styles.container, styles.opaque, style]}>
        <View style={contentStyle}>{children}</View>
      </View>
    );
  }

  const blurConfig = BLUR_CONFIG[variant] ?? BLUR_CONFIG.regular;
  const blurType = DesignTokens.isDarkMode ? blurConfig.darkType : blurConfig.lightType;

  return (
    <BlurView
      style={[styles.container, style]}
      blurType={blurType}
      blurAmount={blurConfig.amount}
      reducedTransparencyFallbackColor={DesignTokens.colors.bgGlass}
    >
      <View style={contentStyle}>{children}</View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  opaque: {
    backgroundColor: DesignTokens.colors.bgCard,
  },
});

export default LiquidGlassView;
