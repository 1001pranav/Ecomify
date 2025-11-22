/**
 * Skeleton Component
 * Loading placeholder with animation
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonProps) {
  const theme = useAppTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.surfaceVariant,
          opacity,
        },
        style,
      ]}
    />
  );
}

// Common skeleton presets
Skeleton.Text = function SkeletonText({ lines = 1 }: { lines?: number }) {
  return (
    <View style={styles.textContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={14}
          width={index === lines - 1 && lines > 1 ? '60%' : '100%'}
          style={index > 0 ? { marginTop: 8 } : undefined}
        />
      ))}
    </View>
  );
};

Skeleton.Avatar = function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
};

Skeleton.Card = function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Skeleton height={150} borderRadius={8} />
      <View style={styles.cardContent}>
        <Skeleton height={16} width="80%" />
        <Skeleton height={14} width="60%" style={{ marginTop: 8 }} />
        <Skeleton height={20} width="40%" style={{ marginTop: 12 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {},
  textContainer: {},
  card: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 12,
  },
});
