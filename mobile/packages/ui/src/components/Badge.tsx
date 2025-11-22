/**
 * Badge Component
 * Status and label badges
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useAppTheme } from '../theme';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}: BadgeProps) {
  const theme = useAppTheme();

  const getVariantStyles = (): { bg: string; text: string } => {
    const variants = {
      default: {
        bg: theme.colors.surfaceVariant,
        text: theme.colors.onSurfaceVariant,
      },
      primary: {
        bg: theme.colors.primaryContainer,
        text: theme.colors.primary,
      },
      secondary: {
        bg: theme.colors.secondaryContainer,
        text: theme.colors.secondary,
      },
      success: {
        bg: '#d1fae5',
        text: '#059669',
      },
      warning: {
        bg: '#fef3c7',
        text: '#d97706',
      },
      error: {
        bg: '#fee2e2',
        text: '#dc2626',
      },
    };

    return variants[variant];
  };

  const colors = getVariantStyles();

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        { backgroundColor: colors.bg },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'sm' ? styles.textSm : styles.textMd,
          { color: colors.text },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeMd: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  text: {
    fontWeight: '500',
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: 12,
  },
});
