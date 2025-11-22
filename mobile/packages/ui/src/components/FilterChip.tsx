/**
 * FilterChip Component
 * Selectable filter chips
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../theme';

interface FilterChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function FilterChip({
  label,
  active = false,
  onPress,
  style,
}: FilterChipProps) {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active
            ? theme.colors.primary
            : theme.colors.surfaceVariant,
          borderColor: active ? theme.colors.primary : theme.colors.outline,
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.label,
          {
            color: active ? '#ffffff' : theme.colors.onSurface,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
