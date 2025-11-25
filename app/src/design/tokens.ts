import { Dimensions, Appearance } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const systemPrefersDark = Appearance.getColorScheme() === 'dark';
const brandLocksDarkMode = true;
// Brand direction is an ultra-dark, neon glass aesthetic that should remain
// consistent regardless of the OS light/dark toggle. We still read the system
// value so future user settings can opt back into light if needed.
const isDarkMode = brandLocksDarkMode || systemPrefersDark;

// #region Colors
const colors = {
  light: {
    bgPrimary: '#030615',
    bgSecondary: '#070D26',
    bgCard: 'rgba(17, 24, 54, 0.85)',
    bgGlass: 'rgba(10,16,38,0.6)',
    textPrimary: '#F5F7FF',
    textSecondary: '#A8B2D8',
    tint: '#7B61FF',
    clarity: '#4DCBFF',
    power: '#FF9E45',
    health: '#4BE0AD',
    expressiveness: '#F9D849',
    confidence: '#9E7CFF',
    warmth: '#FF7DA4',
    error: '#FF5C73',
    separator: 'rgba(255,255,255,0.12)',
    shadow: 'rgba(3,6,21,0.8)',
  },
  dark: {
    bgPrimary: '#030615',
    bgSecondary: '#070D26',
    bgCard: 'rgba(17, 24, 54, 0.85)',
    bgGlass: 'rgba(15,24,52,0.55)',
    textPrimary: '#F5F7FF',
    textSecondary: '#9FA9D3',
    tint: '#6C8BFF',
    clarity: '#4DCBFF',
    power: '#FF9E45',
    health: '#4BE0AD',
    expressiveness: '#F9D849',
    confidence: '#9E7CFF',
    warmth: '#FF7DA4',
    error: '#FF5C73',
    separator: 'rgba(255,255,255,0.12)',
    shadow: 'rgba(0,0,0,0.65)',
  },
};
// #endregion

const gradients = {
  background: ['#030615', '#050C1E', '#071536'],
  heroOrb: ['#47D3FF', '#7B61FF'],
  metricCard: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'],
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
  gradients,
  spacing,
  radii,
  motion,
  typography,
  isDarkMode,
};

export const getColor = (colorName: keyof typeof colors.light) => {
  return DesignTokens.colors[colorName];
};
