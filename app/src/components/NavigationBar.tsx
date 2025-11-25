import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassView } from './LiquidGlassView';
import { DesignTokens } from '../design/tokens';
import { Typography } from '../design/typography';

interface NavigationBarProps {
    title?: string;
    leftSlot?: React.ReactNode;
    rightSlot?: React.ReactNode;
    style?: ViewStyle;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
    title,
    leftSlot,
    rightSlot,
    style,
}) => {
    const insets = useSafeAreaInsets();

    return (
        <LiquidGlassView
            variant="regular"
            style={[styles.container, { paddingTop: insets.top }, style]}
        >
            <View style={styles.content}>
                <View style={styles.leftSlot}>{leftSlot}</View>
                <View style={styles.titleContainer}>
                    {title && <Text style={styles.title}>{title}</Text>}
                </View>
                <View style={styles.rightSlot}>{rightSlot}</View>
            </View>
        </LiquidGlassView>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: DesignTokens.colors.separator,
        zIndex: 10,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 52, // Standard nav bar height
        paddingHorizontal: DesignTokens.spacing.md,
    },
    leftSlot: {
        flex: 1,
        alignItems: 'flex-start',
    },
    titleContainer: {
        flex: 2,
        alignItems: 'center',
    },
    title: {
        ...Typography.title2,
        color: DesignTokens.colors.textPrimary,
        fontWeight: '600',
    },
    rightSlot: {
        flex: 1,
        alignItems: 'flex-end',
    },
});

export default NavigationBar;
