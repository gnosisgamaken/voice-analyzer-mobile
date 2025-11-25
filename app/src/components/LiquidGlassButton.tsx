import React, { useCallback, useRef, useEffect } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
  ActivityIndicator,
  Easing,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useReduceTransparency } from '../hooks/useReduceTransparency';
import { DesignTokens } from '../design/tokens';
import { Typography } from '../design/typography';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'tinted';
type ButtonSize = 'small' | 'medium' | 'large';

interface LiquidGlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';
  fullWidth?: boolean;
}

const HAPTIC_OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const SIZE_CONFIG = {
  small: {
    paddingHorizontal: DesignTokens.spacing.sm,
    paddingVertical: DesignTokens.spacing.xs,
    fontSize: 14,
    minHeight: 32,
    borderRadius: DesignTokens.radii.sm,
  },
  medium: {
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
    fontSize: 16,
    minHeight: 44,
    borderRadius: DesignTokens.radii.md,
  },
  large: {
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    fontSize: 17,
    minHeight: 52,
    borderRadius: DesignTokens.radii.lg,
  },
};

type BlurTypeValue = 'regular' | 'thin' | null;

const VARIANT_CONFIG: Record<ButtonVariant, {
  backgroundColor: string;
  textColor: string;
  blurType: BlurTypeValue;
  borderColor: string;
  pressedOpacity: number;
}> = {
  primary: {
    backgroundColor: DesignTokens.colors.tint,
    textColor: '#FFFFFF',
    blurType: null,
    borderColor: 'transparent',
    pressedOpacity: 0.85,
  },
  secondary: {
    backgroundColor: DesignTokens.colors.bgGlass,
    textColor: DesignTokens.colors.textPrimary,
    blurType: 'regular',
    borderColor: DesignTokens.colors.separator,
    pressedOpacity: 0.9,
  },
  ghost: {
    backgroundColor: 'transparent',
    textColor: DesignTokens.colors.tint,
    blurType: null,
    borderColor: 'transparent',
    pressedOpacity: 0.7,
  },
  destructive: {
    backgroundColor: DesignTokens.colors.error,
    textColor: '#FFFFFF',
    blurType: null,
    borderColor: 'transparent',
    pressedOpacity: 0.85,
  },
  tinted: {
    backgroundColor: DesignTokens.isDarkMode 
      ? 'rgba(94, 92, 230, 0.25)' 
      : 'rgba(88, 86, 214, 0.15)',
    textColor: DesignTokens.colors.tint,
    blurType: 'thin',
    borderColor: 'transparent',
    pressedOpacity: 0.9,
  },
};

export function LiquidGlassButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  hapticType = 'light',
  fullWidth = false,
}: LiquidGlassButtonProps) {
  const reduceTransparency = useReduceTransparency();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const sizeConfig = SIZE_CONFIG[size];
  const variantConfig = VARIANT_CONFIG[variant];

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        damping: 15,
        stiffness: 300,
        mass: 0.8,
      }),
      Animated.timing(opacityAnim, {
        toValue: variantConfig.pressedOpacity,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim, variantConfig.pressedOpacity]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 12,
        stiffness: 200,
        mass: 0.6,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;

    const hapticMap: Record<string, string> = {
      light: 'impactLight',
      medium: 'impactMedium',
      heavy: 'impactHeavy',
      selection: 'selection',
      success: 'notificationSuccess',
      warning: 'notificationWarning',
      error: 'notificationError',
    };

    ReactNativeHapticFeedback.trigger(
      hapticMap[hapticType] as any,
      HAPTIC_OPTIONS
    );

    onPress();
  }, [disabled, loading, hapticType, onPress]);

  const buttonContent = (
    <View style={[
      styles.content,
      icon && iconPosition === 'right' ? styles.contentReversed : undefined,
    ]}>
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variantConfig.textColor}
          style={styles.loadingIndicator}
        />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              { 
                color: variantConfig.textColor,
                fontSize: sizeConfig.fontSize,
              },
              disabled && styles.textDisabled,
              textStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

  const buttonStyles: ViewStyle = {
    paddingHorizontal: sizeConfig.paddingHorizontal,
    paddingVertical: sizeConfig.paddingVertical,
    minHeight: sizeConfig.minHeight,
    borderRadius: sizeConfig.borderRadius,
    borderWidth: variantConfig.borderColor !== 'transparent' ? 1 : 0,
    borderColor: variantConfig.borderColor,
  };

  const shouldUseBlur = variantConfig.blurType && !reduceTransparency;

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
  };

  return (
    <Animated.View style={[animatedStyle, fullWidth && styles.fullWidth, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading }}
      >
        {shouldUseBlur ? (
          <BlurView
            style={[styles.button, buttonStyles]}
            blurType={DesignTokens.isDarkMode ? 'dark' : 'light'}
            blurAmount={16}
            reducedTransparencyFallbackColor={variantConfig.backgroundColor}
          >
            {buttonContent}
          </BlurView>
        ) : (
          <View
            style={[
              styles.button,
              buttonStyles,
              { backgroundColor: variantConfig.backgroundColor },
              disabled && styles.buttonDisabled,
            ]}
          >
            {buttonContent}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing.xs,
  },
  contentReversed: {
    flexDirection: 'row-reverse',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...Typography.headline,
    textAlign: 'center',
  },
  textDisabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
  loadingIndicator: {
    marginHorizontal: DesignTokens.spacing.xs,
  },
});

export default LiquidGlassButton;
