import { Dimensions, Appearance } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const systemPrefersDark = Appearance.getColorScheme() === 'dark';
const isDarkMode = systemPrefersDark;

// #region Colors - Apple Liquid Glass compliant palettes
const colors = {
  light: {
    bgPrimary: '#F2F2F7',
    bgSecondary: '#FFFFFF',
    bgCard: 'rgba(255, 255, 255, 0.72)',
    bgGlass: 'rgba(255, 255, 255, 0.65)',
    textPrimary: '#1C1C1E',
    textSecondary: '#8E8E93',
    tint: '#5856D6',
    clarity: '#007AFF',
    power: '#FF9500',
    health: '#34C759',
    expressiveness: '#FFCC00',
    confidence: '#AF52DE',
    warmth: '#FF2D55',
    error: '#FF3B30',
    separator: 'rgba(60, 60, 67, 0.18)',
    shadow: 'rgba(0, 0, 0, 0.15)',
  },
  dark: {
    bgPrimary: '#000000',
    bgSecondary: '#1C1C1E',
    bgCard: 'rgba(28, 28, 30, 0.75)',
    bgGlass: 'rgba(28, 28, 30, 0.6)',
    textPrimary: '#FFFFFF',
    textSecondary: '#98989D',
    tint: '#5E5CE6',
    clarity: '#0A84FF',
    power: '#FF9F0A',
    health: '#30D158',
    expressiveness: '#FFD60A',
    confidence: '#BF5AF2',
    warmth: '#FF375F',
    error: '#FF453A',
    separator: 'rgba(84, 84, 88, 0.65)',
    shadow: 'rgba(0, 0, 0, 0.55)',
  },
};
// #endregion

const gradients = {
  light: {
    background: ['#F2F2F7', '#E5E5EA', '#D1D1D6'],
    heroOrb: ['#5856D6', '#007AFF'],
    metricCard: ['rgba(0,0,0,0.03)', 'rgba(0,0,0,0.01)'],
  },
  dark: {
    background: ['#000000', '#1C1C1E', '#2C2C2E'],
    heroOrb: ['#5E5CE6', '#0A84FF'],
    metricCard: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'],
  },
};

// #region Spacing
const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  screenWidth,
  screenHeight,
};
// #endregion

// #region Radii
const radii = {
  sm: 8,
  md: 12,
  lg: 20, // Card radius
  xl: 28, // Glass shell radius
  pill: 999,
};
// #endregion

// #region Motion
const motion = {
  spring: {
    duration: 500,
    damping: 0.8,
    response: 0.4,
  },
  fast: {
    duration: 300,
    damping: 0.65,
  },
};
// #endregion

// #region Typography (placeholders, to be implemented in typography.ts)
const typography = {
  largeTitle: {
    // Corresponds to .largeTitle
    fontFamily: 'System',
    fontSize: 34,
    fontWeight: '700',
  },
  title2: {
    // Corresponds to .title2
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '600',
  },
  body: {
    // Corresponds to .body
    fontFamily: 'System',
    fontSize: 17,
    fontWeight: '400',
  },
  caption1: {
    // Corresponds to .caption1
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500',
  },
  caption2: {
    // Corresponds to .caption2
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '400',
  },
  headline: {
    // Corresponds to .headline
    fontFamily: 'System',
    fontSize: 17,
    fontWeight: '600',
  },
  title3: {
    // Corresponds to .title3
    fontFamily: 'System',
    fontSize: 20,
    fontWeight: '600',
  },
};
// #endregion

export const DesignTokens = {
  colors: isDarkMode ? colors.dark : colors.light,
  gradients: isDarkMode ? gradients.dark : gradients.light,
  spacing,
  radii,
  motion,
  typography,
  isDarkMode,
};

export const getColor = (colorName: keyof typeof colors.light) => {
  return DesignTokens.colors[colorName];
};
