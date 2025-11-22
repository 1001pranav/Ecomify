/**
 * EmptyState Component
 * Display when no data is available
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      {icon && (
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          {icon}
        </View>
      )}
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        {title}
      </Text>
      {description && (
        <Text
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
        >
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
  },
  button: {
    marginTop: 24,
  },
});
