/**
 * Button Component
 * Customizable button with variants
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useAppTheme } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const theme = useAppTheme();

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    const variants = {
      primary: {
        container: {
          backgroundColor: theme.colors.primary,
        },
        text: {
          color: '#ffffff',
        },
      },
      secondary: {
        container: {
          backgroundColor: theme.colors.secondary,
        },
        text: {
          color: '#ffffff',
        },
      },
      outline: {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.outline,
        },
        text: {
          color: theme.colors.onSurface,
        },
      },
      ghost: {
        container: {
          backgroundColor: 'transparent',
        },
        text: {
          color: theme.colors.primary,
        },
      },
      destructive: {
        container: {
          backgroundColor: theme.colors.error,
        },
        text: {
          color: '#ffffff',
        },
      },
    };

    return variants[variant];
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    const sizes = {
      sm: {
        container: {
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 6,
        },
        text: {
          fontSize: 14,
        },
      },
      md: {
        container: {
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
        },
        text: {
          fontSize: 16,
        },
      },
      lg: {
        container: {
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 10,
        },
        text: {
          fontSize: 18,
        },
      },
    };

    return sizes[size];
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variantStyles.text.color}
          size={size === 'lg' ? 'small' : 'small'}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              variantStyles.text,
              sizeStyles.text,
              icon && styles.textWithIcon,
              textStyle,
            ]}
          >
            {children}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textWithIcon: {
    marginLeft: 8,
  },
});
