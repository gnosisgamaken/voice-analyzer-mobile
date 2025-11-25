import React from 'react';
import { Text, Platform, StyleSheet } from 'react-native';
import { SFSymbol as RNSFSymbol, SFSymbolWeight, SFSymbolScale } from 'react-native-sfsymbols';
import { DesignTokens } from '../design/tokens';

interface SFSymbolProps {
  name: string;
  style?: any;
  // Add other props from react-native-sfsymbols as needed
  weight?: SFSymbolWeight;
  scale?: SFSymbolScale;
  color?: string;
  size?: number;
  fallback?: React.ReactNode;
}

const SFSymbol: React.FC<SFSymbolProps> = ({ name, style, fallback, ...props }) => {
  if (Platform.OS === 'ios') {
    return <RNSFSymbol name={name} style={style} {...props} />;
  }

  // Fallback for non-iOS platforms
  return fallback || <Text style={[styles.fallback, style]}>🖼️</Text>;
};

const styles = StyleSheet.create({
  fallback: {
    color: DesignTokens.colors.textPrimary,
  }
})

export default SFSymbol;
