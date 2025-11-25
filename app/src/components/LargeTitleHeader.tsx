import React from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DesignTokens } from '../design/tokens';
import { Typography } from '../design/typography';
import { useReduceTransparency } from '../hooks/useReduceTransparency';

const HEADER_MAX_HEIGHT = 120;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 96 : 60;
const TITLE_Y_OFFSET = 20;

interface LargeTitleHeaderProps {
  title: string;
  scrollOffsetY: Animated.Value;
  leadingIcon?: React.ReactNode;
  trailingActions?: React.ReactNode;
}

export const LargeTitleHeader: React.FC<LargeTitleHeaderProps> = ({
  title,
  scrollOffsetY,
  leadingIcon,
  trailingActions,
}) => {
  const insets = useSafeAreaInsets();
  const reduceTransparency = useReduceTransparency();

  const headerHeight = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [0, -TITLE_Y_OFFSET],
    extrapolate: 'clamp',
  });

  const titleScale = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });
  
  const titleOpacity = scrollOffsetY.interpolate({
    inputRange: [0, (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  const smallTitleOpacity = scrollOffsetY.interpolate({
    inputRange: [(HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) / 2, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });


  return (
    <Animated.View
      style={[
        styles.container,
        { 
          height: headerHeight,
          paddingTop: insets.top,
        },
      ]}
      accessibilityRole="header"
    >
      {!reduceTransparency ? (
        <BlurView
          style={styles.blurView}
          blurType={DesignTokens.isDarkMode ? 'dark' : 'light'}
          blurAmount={20}
          reducedTransparencyFallbackColor={DesignTokens.colors.bgPrimary}
        />
      ) : (
        <View style={styles.solidBackground} />
      )}
      
      <View style={styles.headerContent}>
        {leadingIcon && <View style={styles.leadingIcon}>{leadingIcon}</View>}
        <Animated.View style={[styles.titleContainer, { transform: [{ translateY: titleTranslateY }] }]}>
            <Animated.Text style={[Typography.largeTitle, styles.title, { transform: [{ scale: titleScale }], opacity: titleOpacity }]}>
                {title}
            </Animated.Text>
        </Animated.View>
        <Animated.Text style={[Typography.title2, styles.smallTitle, {opacity: smallTitleOpacity}]}>
            {title}
        </Animated.Text>
        {trailingActions && (
          <View style={styles.trailingActions}>{trailingActions}</View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DesignTokens.colors.separator,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  solidBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DesignTokens.colors.bgSecondary,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DesignTokens.spacing.md,
  },
  leadingIcon: {
    position: 'absolute',
    left: DesignTokens.spacing.md,
    bottom: 12,
  },
  trailingActions: {
    position: 'absolute',
    right: DesignTokens.spacing.md,
    bottom: 12,
  },
  titleContainer: {
    position: 'absolute',
    left: DesignTokens.spacing.md,
    bottom: 12,
  },
  title: {
    color: DesignTokens.colors.textPrimary,
  },
  smallTitle: {
    color: DesignTokens.colors.textPrimary,
    position: 'absolute',
    bottom: 12,
  }
});

export default LargeTitleHeader;
