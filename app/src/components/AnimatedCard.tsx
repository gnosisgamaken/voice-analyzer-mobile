import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useReduceMotion } from '../hooks/useReduceMotion';

interface AnimatedCardProps {
  children: React.ReactNode;
  index: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, index }) => {
  const reduceMotion = useReduceMotion();
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      translateY.setValue(0);
      opacity.setValue(1);
      return;
    }

    Animated.stagger(100, [
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [reduceMotion, opacity, translateY, index]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};
