/**
 * SearchBar Component
 * Search input with clear button
 */

import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { useAppTheme } from '../theme';

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  style?: object;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search...',
  leftIcon,
  style,
  ...props
}: SearchBarProps) {
  const theme = useAppTheme();

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.outline,
        },
        style,
      ]}
    >
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      <TextInput
        {...props}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        style={[
          styles.input,
          {
            color: theme.colors.onSurface,
          },
          leftIcon && styles.inputWithIcon,
        ]}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <View
            style={[
              styles.clearIcon,
              { backgroundColor: theme.colors.onSurfaceVariant },
            ]}
          >
            <View style={[styles.clearX, { backgroundColor: theme.colors.surface }]} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    height: 44,
    paddingHorizontal: 12,
  },
  leftIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  inputWithIcon: {
    marginLeft: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearX: {
    width: 8,
    height: 2,
    borderRadius: 1,
  },
});
