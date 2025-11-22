/**
 * Refresh on Focus Hook
 * Refetch data when screen comes into focus
 */

import { useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Hook to refresh data when screen is focused
 */
export function useRefreshOnFocus(refetch: () => void, enabled: boolean = true) {
  useFocusEffect(
    useCallback(() => {
      if (enabled) {
        refetch();
      }
    }, [refetch, enabled])
  );
}

/**
 * Hook to run effect when screen is focused
 */
export function useOnFocus(callback: () => void | (() => void)) {
  useFocusEffect(
    useCallback(() => {
      return callback();
    }, [callback])
  );
}

/**
 * Hook to run effect when screen is blurred (unfocused)
 */
export function useOnBlur(callback: () => void) {
  useFocusEffect(
    useCallback(() => {
      return () => {
        callback();
      };
    }, [callback])
  );
}
