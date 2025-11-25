import React, { PropsWithChildren } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { LiquidGlassView } from './LiquidGlassView';
import { DesignTokens } from '../design/tokens';

export type MaterialVariant =
  | 'glass-regular'
  | 'glass-clear'
  | 'solid-elevated'
  | 'solid-flat';

interface MaterialCardProps extends PropsWithChildren {
  variant?: MaterialVariant;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  variant = 'solid-flat',
  style,
  contentStyle,
  children,
}) => {
  const containerStyle = [styles.card, style];

  if (variant === 'solid-flat') {
    return (
      <View style={[containerStyle, styles.solidFlat, contentStyle]}>
        {children}
      </View>
    );
  }

  if (variant === 'solid-elevated') {
    return (
      <View style={[containerStyle, styles.solidElevated, contentStyle]}>
        {children}
      </View>
    );
  }

  const glassVariant = variant === 'glass-clear' ? 'clear' : 'regular';

  return (
    <LiquidGlassView
      variant={glassVariant}
      style={[containerStyle, styles.glassContainer]}
    >
      <View style={contentStyle}>{children}</View>
    </LiquidGlassView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: DesignTokens.radii.lg,
    overflow: 'hidden',
  },
  solidFlat: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: DesignTokens.spacing.md,
  },
  solidElevated: {
    backgroundColor: DesignTokens.colors.bgCard,
    padding: DesignTokens.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(3,6,21,0.6)',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 18,
        shadowOpacity: 1,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  glassContainer: {
    padding: DesignTokens.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
});

export default MaterialCard;
