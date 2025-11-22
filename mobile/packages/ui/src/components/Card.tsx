/**
 * Card Component
 * Compound component pattern for flexible cards
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useAppTheme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

// Card Header
function CardHeader({ children, style }: CardHeaderProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.header,
        { borderBottomColor: theme.colors.outlineVariant },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Card Title
function CardTitle({ children, style }: CardTitleProps) {
  const theme = useAppTheme();

  return (
    <Text style={[styles.title, { color: theme.colors.onSurface }, style]}>
      {children}
    </Text>
  );
}

// Card Content
function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}

// Card Footer
function CardFooter({ children, style }: CardFooterProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.footer,
        { borderTopColor: theme.colors.outlineVariant },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Main Card Component
function CardRoot({ children, style, padding = 'md' }: CardProps) {
  const theme = useAppTheme();

  const paddingValues = {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
          padding: paddingValues[padding],
        },
        theme.custom.cardShadow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Compound Component Export
export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Content: CardContent,
  Footer: CardFooter,
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
});
