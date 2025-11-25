import React, { useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LargeTitleHeader } from '../components/LargeTitleHeader';
import { MaterialCard } from '../components/MaterialCard';
import { DesignTokens } from '../design/tokens';
import { Typography } from '../design/typography';

import SFSymbol from '../components/SFSymbol';

const HEADER_MAX_HEIGHT = 120;

export default function DesignSystemGalleryScreen() {
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  
  const scrollContentStyle = useMemo(() => ({
    paddingTop: HEADER_MAX_HEIGHT + insets.top,
    paddingHorizontal: DesignTokens.spacing.md,
    paddingBottom: DesignTokens.spacing.xl,
    gap: DesignTokens.spacing.lg,
  }), [insets.top]);

  const headerActions = (
    <View style={styles.headerActions}>
      <SFSymbol name="plus.circle.fill" style={styles.headerIcon} />
    </View>
  );

  return (
    <View style={styles.screen}>
      <LargeTitleHeader
        title="Component Gallery"
        scrollOffsetY={scrollOffsetY}
        trailingActions={headerActions}
      />
      <Animated.ScrollView
        contentContainerStyle={scrollContentStyle}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <Text style={styles.sectionHeader}>Typography</Text>
        <View style={styles.showcase}>
            <Text style={Typography.largeTitle}>Large Title</Text>
            <Text style={Typography.title2}>Title 2</Text>
            <Text style={Typography.body}>Body</Text>
            <Text style={Typography.caption1}>Caption 1</Text>
            <Text style={Typography.caption2}>Caption 2</Text>
        </View>

        <Text style={styles.sectionHeader}>MaterialCard (Solid)</Text>
        <View style={styles.showcase}>
            <MaterialCard variant="solid-elevated">
                <Text style={styles.cardText}>This is a solid MaterialCard. It's used for primary content and data display.</Text>
            </MaterialCard>
        </View>

        <Text style={styles.sectionHeader}>MaterialCard (Glass)</Text>
        <View style={styles.showcase}>
            <MaterialCard variant="glass-regular">
                <Text style={styles.cardText}>This is a glass MaterialCard. It's used for sidebars and other secondary surfaces.</Text>
            </MaterialCard>
        </View>
        
        <Text style={styles.sectionHeader}>SF Symbols</Text>
        <View style={styles.showcase}>
          <Text style={styles.cardText}>iOS:</Text>
          <View style={styles.symbolRow}>
            <SFSymbol name="mic.fill" size={24} />
            <SFSymbol name="trash.fill" size={24} color={DesignTokens.colors.error} />
            <SFSymbol name="plus.circle.fill" size={24} color={DesignTokens.colors.health} />
          </View>
          <Text style={styles.cardText}>Fallback (Android/Web):</Text>
          <View style={styles.symbolRow}>
            <SFSymbol name="mic.fill" size={24} />
            <SFSymbol name="trash.fill" size={24} color={DesignTokens.colors.error} />
            <SFSymbol name="plus.circle.fill" size={24} fallback={<Text>fallback</Text>} />
          </View>
        </View>

        <Text style={styles.sectionHeader}>Colors</Text>
        <View style={styles.showcase}>
            <View style={styles.colorGrid}>
                {Object.entries(DesignTokens.colors).map(([name, color]) => (
                    <View key={name} style={styles.colorSwatch}>
                        <View style={[styles.colorChip, { backgroundColor: color as string }]} />
                        <Text style={styles.colorName}>{name}</Text>
                    </View>
                ))}
            </View>
        </View>

      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: DesignTokens.colors.bgPrimary,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerIcon: {
    fontSize: 28,
    color: DesignTokens.colors.tint,
  },
  sectionHeader: {
    ...Typography.title2,
    color: DesignTokens.colors.textPrimary,
    marginTop: DesignTokens.spacing.lg,
  },
  showcase: {
    gap: DesignTokens.spacing.md,
  },
  symbolRow: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.lg,
    alignItems: 'center',
  },
  cardText: {
    ...Typography.body,
    color: DesignTokens.colors.textPrimary,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing.md,
  },
  colorSwatch: {
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
  },
  colorChip: {
    width: 60,
    height: 60,
    borderRadius: DesignTokens.radii.md,
    borderWidth: 1,
    borderColor: DesignTokens.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  colorName: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
  }
});
