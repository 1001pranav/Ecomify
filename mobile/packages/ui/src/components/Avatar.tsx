/**
 * Avatar Component
 * User avatar with fallback initials
 */

import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../theme';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

export function Avatar({ source, name, size = 'md', style }: AvatarProps) {
  const theme = useAppTheme();

  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const sizes = {
    xs: { container: 24, text: 10 },
    sm: { container: 32, text: 12 },
    md: { container: 40, text: 14 },
    lg: { container: 56, text: 18 },
    xl: { container: 80, text: 24 },
  };

  const sizeValue = sizes[size];

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        style={[
          styles.image,
          {
            width: sizeValue.container,
            height: sizeValue.container,
            borderRadius: sizeValue.container / 2,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: sizeValue.container,
          height: sizeValue.container,
          borderRadius: sizeValue.container / 2,
          backgroundColor: theme.colors.primaryContainer,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: sizeValue.text,
            color: theme.colors.primary,
          },
        ]}
      >
        {name ? getInitials(name) : '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#e5e7eb',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '600',
  },
});
