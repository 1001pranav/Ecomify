/**
 * Storage Utilities
 * Wrapper around AsyncStorage with type safety
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage keys enum
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  CART: 'cart',
  RECENTLY_VIEWED: 'recently_viewed',
  SEARCH_HISTORY: 'search_history',
  THEME: 'theme',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  SAVED_EMAIL: 'saved_email',
  NOTIFICATION_TOKEN: 'notification_token',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Get item from storage
 */
export async function getStorageItem<T>(key: StorageKey): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error getting storage item ${key}:`, error);
    return null;
  }
}

/**
 * Set item in storage
 */
export async function setStorageItem<T>(key: StorageKey, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting storage item ${key}:`, error);
    throw error;
  }
}

/**
 * Remove item from storage
 */
export async function removeStorageItem(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing storage item ${key}:`, error);
    throw error;
  }
}

/**
 * Clear all storage
 */
export async function clearStorage(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
}

/**
 * Get multiple items from storage
 */
export async function getMultipleStorageItems(
  keys: StorageKey[]
): Promise<Record<string, unknown>> {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    return pairs.reduce(
      (acc, [key, value]) => {
        acc[key] = value ? JSON.parse(value) : null;
        return acc;
      },
      {} as Record<string, unknown>
    );
  } catch (error) {
    console.error('Error getting multiple storage items:', error);
    return {};
  }
}

/**
 * Set multiple items in storage
 */
export async function setMultipleStorageItems(
  items: Array<[StorageKey, unknown]>
): Promise<void> {
  try {
    const pairs = items.map(([key, value]) => [key, JSON.stringify(value)] as [string, string]);
    await AsyncStorage.multiSet(pairs);
  } catch (error) {
    console.error('Error setting multiple storage items:', error);
    throw error;
  }
}

/**
 * Get all storage keys
 */
export async function getAllStorageKeys(): Promise<readonly string[]> {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Error getting all storage keys:', error);
    return [];
  }
}
