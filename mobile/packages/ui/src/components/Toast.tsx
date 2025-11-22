/**
 * Toast Component
 * Toast notification display
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../theme';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
  visible?: boolean;
}

export function Toast({
  message,
  type = 'info',
  duration = 3000,
  onHide,
  visible = true,
}: ToastProps) {
  const theme = useAppTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: -100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  const getTypeStyles = () => {
    const types = {
      success: {
        bg: '#d1fae5',
        text: '#065f46',
        border: '#10b981',
      },
      error: {
        bg: '#fee2e2',
        text: '#991b1b',
        border: '#ef4444',
      },
      warning: {
        bg: '#fef3c7',
        text: '#92400e',
        border: '#f59e0b',
      },
      info: {
        bg: '#dbeafe',
        text: '#1e40af',
        border: '#3b82f6',
      },
    };

    return types[type];
  };

  const typeStyles = getTypeStyles();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        onPress={hideToast}
        activeOpacity={0.9}
        style={[
          styles.toast,
          {
            backgroundColor: typeStyles.bg,
            borderLeftColor: typeStyles.border,
          },
        ]}
      >
        <Text style={[styles.message, { color: typeStyles.text }]}>
          {message}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
  },
});
