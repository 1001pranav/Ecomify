/**
 * MetricCard Component
 * Dashboard metric display card
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme';
import { Card } from './Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
}: MetricCardProps) {
  const theme = useAppTheme();

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#10b981';
      case 'down':
        return '#ef4444';
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '';
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
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
      </View>
      <Text style={[styles.value, { color: theme.colors.onSurface }]}>
        {value}
      </Text>
      <Text
        style={[styles.title, { color: theme.colors.onSurfaceVariant }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {change && (
        <View style={styles.changeContainer}>
          <Text style={[styles.change, { color: getTrendColor() }]}>
            {getTrendIcon()} {change}
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  change: {
    fontSize: 12,
    fontWeight: '600',
  },
});
