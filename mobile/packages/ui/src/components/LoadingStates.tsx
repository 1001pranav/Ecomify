/**
 * Loading State Components
 * Various loading indicators and skeleton components
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '../theme';

// Full screen loading
interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.loadingScreen, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message && (
        <Text style={[styles.loadingMessage, { color: theme.colors.onSurfaceVariant }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

// Inline loading spinner
interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

export function LoadingSpinner({ size = 'small', color }: LoadingSpinnerProps) {
  const theme = useAppTheme();

  return (
    <ActivityIndicator
      size={size}
      color={color || theme.colors.primary}
    />
  );
}

// Skeleton loading placeholder
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
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
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

// Skeleton text (multiple lines)
interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: number | string;
  lineHeight?: number;
  style?: ViewStyle;
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = '60%',
  lineHeight = 16,
  style,
}: SkeletonTextProps) {
  return (
    <View style={style}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={lineHeight}
          style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
        />
      ))}
    </View>
  );
}

// Skeleton card
export function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <Skeleton width={80} height={80} borderRadius={8} />
      <View style={styles.skeletonCardContent}>
        <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="60%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={14} />
      </View>
    </View>
  );
}

// Skeleton list (multiple cards)
interface SkeletonListProps {
  count?: number;
}

export function SkeletonList({ count = 3 }: SkeletonListProps) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}

// Skeleton grid
interface SkeletonGridProps {
  count?: number;
  columns?: number;
}

export function SkeletonGrid({ count = 6, columns = 2 }: SkeletonGridProps) {
  return (
    <View style={[styles.skeletonGrid, { flexWrap: 'wrap' }]}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.skeletonGridItem,
            { width: `${100 / columns}%` },
          ]}
        >
          <Skeleton height={150} borderRadius={8} style={{ marginBottom: 8 }} />
          <Skeleton width="80%" height={14} style={{ marginBottom: 4 }} />
          <Skeleton width="50%" height={14} />
        </View>
      ))}
    </View>
  );
}

// Loading overlay (for showing loading on top of content)
interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <ActivityIndicator size="large" color="#fff" />
        {message && <Text style={styles.overlayMessage}>{message}</Text>}
      </View>
    </View>
  );
}

// Pull to refresh indicator
interface RefreshIndicatorProps {
  refreshing: boolean;
}

export function RefreshIndicator({ refreshing }: RefreshIndicatorProps) {
  const theme = useAppTheme();

  if (!refreshing) return null;

  return (
    <View style={styles.refreshIndicator}>
      <ActivityIndicator size="small" color={theme.colors.primary} />
      <Text style={[styles.refreshText, { color: theme.colors.onSurfaceVariant }]}>
        Refreshing...
      </Text>
    </View>
  );
}

// Loading button content
interface LoadingButtonContentProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  color?: string;
}

export function LoadingButtonContent({
  loading,
  children,
  loadingText,
  color = '#fff',
}: LoadingButtonContentProps) {
  if (loading) {
    return (
      <View style={styles.loadingButtonContent}>
        <ActivityIndicator size="small" color={color} />
        {loadingText && (
          <Text style={[styles.loadingButtonText, { color }]}>{loadingText}</Text>
        )}
      </View>
    );
  }

  return <>{children}</>;
}

// Shimmer effect skeleton
interface ShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Shimmer({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}: ShimmerProps) {
  const theme = useAppTheme();
  const animatedValue = React.useRef(new Animated.Value(-1)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [-1, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.surfaceVariant,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerGradient,
          {
            transform: [{ translateX }],
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMessage: {
    marginTop: 16,
    fontSize: 14,
  },
  skeletonCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
  },
  skeletonCardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  skeletonGrid: {
    flexDirection: 'row',
  },
  skeletonGridItem: {
    padding: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  overlayMessage: {
    color: '#fff',
    marginTop: 12,
    fontSize: 14,
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  refreshText: {
    marginLeft: 8,
    fontSize: 12,
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  shimmerGradient: {
    width: 100,
    height: '100%',
  },
});
