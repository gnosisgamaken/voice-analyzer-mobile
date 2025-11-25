import { StyleSheet, Platform, TextStyle } from 'react-native';

const FONT_WEIGHTS = {
  bold: '700',
  semibold: '600',
  medium: '500',
  regular: '400',
};

const fontConfig = {
  largeTitle: {
    fontSize: 34,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 41,
    letterSpacing: Platform.OS === 'ios' ? 0.37 : undefined,
  },
  title2: {
    fontSize: 22,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 28,
    letterSpacing: Platform.OS === 'ios' ? 0.35 : undefined,
  },
  title3: {
    fontSize: 20,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 25,
    letterSpacing: Platform.OS === 'ios' ? 0.38 : undefined,
  },
  headline: {
    fontSize: 17,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 22,
    letterSpacing: Platform.OS === 'ios' ? -0.41 : undefined,
  },
  body: {
    fontSize: 17,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 22,
    letterSpacing: Platform.OS === 'ios' ? -0.41 : undefined,
  },
  caption1: {
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 16,
    letterSpacing: Platform.OS === 'ios' ? 0.0 : undefined,
  },
  caption2: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 13,
    letterSpacing: Platform.OS === 'ios' ? 0.07 : undefined,
  },
};

export const Typography = StyleSheet.create({
  largeTitle: fontConfig.largeTitle as TextStyle,
  title2: fontConfig.title2 as TextStyle,
  title3: fontConfig.title3 as TextStyle,
  headline: fontConfig.headline as TextStyle,
  body: fontConfig.body as TextStyle,
  caption1: fontConfig.caption1 as TextStyle,
  caption2: fontConfig.caption2 as TextStyle,
});

/**
 * Helper to apply dynamic type support to a text component.
 * Not strictly necessary as of React Native 0.60+ if using Text component,
 * but can be used to ensure the property is consistently applied.
 */
export const withDynamicType = (style: TextStyle): TextStyle => ({
  ...style,
  ...(Platform.OS === 'ios' && { adjustsFontForContentSizeCategory: true }),
});
