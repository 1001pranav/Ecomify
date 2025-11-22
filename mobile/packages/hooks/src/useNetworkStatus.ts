/**
 * Network Status Hook
 * Monitor network connectivity
 */

import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { syncManager } from '@ecomify/core';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  isWifi: boolean;
  isCellular: boolean;
}

/**
 * Hook to monitor network status
 */
export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    isWifi: false,
    isCellular: false,
  });

  useEffect(() => {
    // Initial fetch
    NetInfo.fetch().then(handleNetworkChange);

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleNetworkChange = (state: NetInfoState) => {
    const isOnline = state.isConnected && (state.isInternetReachable ?? true);

    // Update sync manager with online status
    syncManager.setOnlineStatus(isOnline);

    setNetworkStatus({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isWifi: state.type === 'wifi',
      isCellular: state.type === 'cellular',
    });
  };

  return networkStatus;
}

/**
 * Hook to get simple online/offline status
 */
export function useIsOnline(): boolean {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  return isConnected && (isInternetReachable ?? true);
}

/**
 * Hook to handle offline sync
 */
export function useOfflineSync() {
  const isOnline = useIsOnline();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<{
    success: boolean;
    synced: number;
    failed: number;
  } | null>(null);

  const sync = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await syncManager.syncAll();
      setLastSyncResult({
        success: result.success,
        synced: result.synced,
        failed: result.failed,
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && !isSyncing) {
      sync();
    }
  }, [isOnline]);

  return {
    isOnline,
    isSyncing,
    lastSyncResult,
    sync,
  };
}
