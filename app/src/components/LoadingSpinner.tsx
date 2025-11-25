import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { DesignTokens } from '../design/tokens';

interface LoadingSpinnerProps {
    size?: number;
    color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 24,
    color = DesignTokens.colors.tint,
}) => {
    const rotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startRotation = () => {
            Animated.loop(
                Animated.timing(rotation, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        };

        startRotation();
    }, [rotation]);

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Animated.View
                style={[
                    styles.spinner,
                    {
                        width: size,
                        height: size,
                        borderColor: color,
                        borderTopColor: 'transparent',
                        borderRadius: size / 2,
                        borderWidth: size / 8,
                        transform: [{ rotate: spin }],
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinner: {
        // Styles are dynamic based on props
    },
});
