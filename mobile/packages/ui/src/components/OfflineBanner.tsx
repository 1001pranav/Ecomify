/**
 * Offline Banner Component
 * Shows network connectivity status
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../theme';

interface OfflineBannerProps {
  isOnline: boolean;
  isSyncing?: boolean;
  pendingCount?: number;
  onSync?: () => void;
}

export function OfflineBanner({
  isOnline,
  isSyncing = false,
  pendingCount = 0,
  onSync,
}: OfflineBannerProps) {
  const theme = useAppTheme();
  const slideAnim = useRef(new Animated.Value(isOnline ? -60 : 0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOnline && pendingCount === 0 ? -60 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnline, pendingCount, slideAnim]);

  const backgroundColor = isOnline
    ? isSyncing
      ? '#f59e0b' // Orange - syncing
      : '#10b981' // Green - online with pending
    : '#ef4444'; // Red - offline

  const getMessage = () => {
    if (!isOnline) {
      return 'You are offline';
    }
    if (isSyncing) {
      return 'Syncing changes...';
    }
    if (pendingCount > 0) {
      return `${pendingCount} change${pendingCount > 1 ? 's' : ''} pending`;
    }
    return 'Back online';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.indicator}>
          {isSyncing ? (
            <View style={styles.syncingDot} />
          ) : (
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOnline ? '#86efac' : '#fca5a5' },
              ]}
            />
          )}
        </View>
        <Text style={styles.message}>{getMessage()}</Text>
        {isOnline && pendingCount > 0 && !isSyncing && onSync && (
          <TouchableOpacity onPress={onSync} style={styles.syncButton}>
            <Text style={styles.syncButtonText}>Sync Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

// Minimal offline indicator (just a small dot)
interface OfflineIndicatorProps {
  isOnline: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function OfflineIndicator({ isOnline, size = 'small' }: OfflineIndicatorProps) {
  const sizes = {
    small: 8,
    medium: 12,
    large: 16,
  };

  if (isOnline) return null;

  return (
    <View
      style={[
        styles.offlineIndicator,
        {
          width: sizes[size],
          height: sizes[size],
          borderRadius: sizes[size] / 2,
        },
      ]}
    />
  );
}

// Toast-style network status notification
interface NetworkToastProps {
  visible: boolean;
  isOnline: boolean;
  onDismiss?: () => void;
}

export function NetworkToast({ visible, isOnline, onDismiss }: NetworkToastProps) {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 3 seconds
      const timer = setTimeout(() => {
        dismiss();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss?.());
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: isOnline ? '#10b981' : '#ef4444',
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={styles.toastText}>
        {isOnline ? '✓ Back online' : '✕ No connection'}
      </Text>
    </Animated.View>
  );
}

// Sync status badge
interface SyncBadgeProps {
  status: 'synced' | 'syncing' | 'pending' | 'error';
  count?: number;
}

export function SyncBadge({ status, count }: SyncBadgeProps) {
  const getConfig = () => {
    switch (status) {
      case 'synced':
        return { color: '#10b981', text: '✓', label: 'Synced' };
      case 'syncing':
        return { color: '#f59e0b', text: '↻', label: 'Syncing' };
      case 'pending':
        return { color: '#3b82f6', text: count?.toString() || '•', label: 'Pending' };
      case 'error':
        return { color: '#ef4444', text: '!', label: 'Error' };
      default:
        return { color: '#6b7280', text: '?', label: 'Unknown' };
    }
  };

  const config = getConfig();

  return (
    <View style={[styles.syncBadge, { backgroundColor: config.color }]}>
      <Text style={styles.syncBadgeText}>{config.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  indicator: {
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  syncingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    opacity: 0.7,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  syncButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  offlineIndicator: {
    backgroundColor: '#ef4444',
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  syncBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
