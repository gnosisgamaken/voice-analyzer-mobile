import React, { PropsWithChildren } from 'react';
import { View, StyleSheet, Platform, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useReduceTransparency } from '../hooks/useReduceTransparency';
import { DesignTokens } from '../design/tokens';

type GlassVariant = 'regular' | 'clear' | 'thin' | 'ultra';

interface LiquidGlassViewProps {
  style?: StyleProp<ViewStyle>;
  variant?: GlassVariant;
  children?: React.ReactNode;
}

const BLUR_CONFIG: Record<GlassVariant, { amount: number; type: 'light' | 'dark' | 'regular' | 'xlight' }> = {
  thin: { amount: 16, type: 'light' },
  regular: { amount: 22, type: 'regular' },
  ultra: { amount: 30, type: 'dark' }, // 'prominent' is mapped to 'dark' for BlurView, so we can use 'dark' directly here.
  clear: { amount: 12, type: 'xlight' },
};

export function LiquidGlassView({
  children,
  style,
  variant = 'regular',
}: LiquidGlassViewProps) {
  const reduceTransparency = useReduceTransparency();

  if (reduceTransparency) {
    return (
      <View style={[styles.container, styles.opaque, style]}>
        {children}
      </View>
    );
  }

  const blurConfig = BLUR_CONFIG[variant] ?? BLUR_CONFIG.regular;

  const blurType = DesignTokens.isDarkMode ? 'dark' : blurConfig.type;

  return (
    <BlurView
      style={[styles.container, style]}
      blurType={blurType}
      blurAmount={blurConfig.amount}
      reducedTransparencyFallbackColor={DesignTokens.colors.bgGlass}
    >
      {children}
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
