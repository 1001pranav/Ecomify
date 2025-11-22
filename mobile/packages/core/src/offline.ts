/**
 * Offline Storage and Sync Service
 * Handles offline data persistence and synchronization
 */

import { storage, StorageKeys } from './storage';

// Sync status types
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface OfflineItem<T = unknown> {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: T;
  timestamp: number;
  status: SyncStatus;
  retryCount: number;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

// Offline queue for pending changes
class OfflineQueue {
  private static readonly QUEUE_KEY = 'offline_queue';
  private static readonly MAX_RETRIES = 3;

  async getQueue(): Promise<OfflineItem[]> {
    const queue = await storage.get<OfflineItem[]>(this.constructor.name + '_queue');
    return queue || [];
  }

  async addToQueue<T>(item: Omit<OfflineItem<T>, 'id' | 'timestamp' | 'status' | 'retryCount'>): Promise<OfflineItem<T>> {
    const queue = await this.getQueue();

    const newItem: OfflineItem<T> = {
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    queue.push(newItem as OfflineItem);
    await storage.set(this.constructor.name + '_queue', queue);

    return newItem;
  }

  async updateItem(id: string, updates: Partial<OfflineItem>): Promise<void> {
    const queue = await this.getQueue();
    const index = queue.findIndex(item => item.id === id);

    if (index !== -1) {
      queue[index] = { ...queue[index], ...updates };
      await storage.set(this.constructor.name + '_queue', queue);
    }
  }

  async removeFromQueue(id: string): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter(item => item.id !== id);
    await storage.set(this.constructor.name + '_queue', filtered);
  }

  async clearQueue(): Promise<void> {
    await storage.remove(this.constructor.name + '_queue');
  }

  async getPendingItems(): Promise<OfflineItem[]> {
    const queue = await this.getQueue();
    return queue.filter(item =>
      item.status === 'pending' &&
      item.retryCount < OfflineQueue.MAX_RETRIES
    );
  }

  async getFailedItems(): Promise<OfflineItem[]> {
    const queue = await this.getQueue();
    return queue.filter(item =>
      item.status === 'failed' ||
      item.retryCount >= OfflineQueue.MAX_RETRIES
    );
  }
}

export const offlineQueue = new OfflineQueue();

// Offline data cache
class OfflineCache {
  private static readonly CACHE_PREFIX = 'cache_';
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  async get<T>(key: string): Promise<T | null> {
    const cacheKey = OfflineCache.CACHE_PREFIX + key;
    const cached = await storage.get<{ data: T; timestamp: number }>(cacheKey);

    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > OfflineCache.CACHE_TTL) {
      await storage.remove(cacheKey);
      return null;
    }

    return cached.data;
  }

  async set<T>(key: string, data: T): Promise<void> {
    const cacheKey = OfflineCache.CACHE_PREFIX + key;
    await storage.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }

  async remove(key: string): Promise<void> {
    await storage.remove(OfflineCache.CACHE_PREFIX + key);
  }

  async clearAll(): Promise<void> {
    // This would need to enumerate all keys with cache prefix
    // For now, just clear specific known caches
    const cacheKeys = [
      'products',
      'categories',
      'user',
      'orders',
      'cart',
    ];

    await Promise.all(cacheKeys.map(key => this.remove(key)));
  }

  // Cache with automatic fetch on miss
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    forceRefresh = false
  ): Promise<T> {
    if (!forceRefresh) {
      const cached = await this.get<T>(key);
      if (cached !== null) return cached;
    }

    const data = await fetchFn();
    await this.set(key, data);
    return data;
  }
}

export const offlineCache = new OfflineCache();

// Sync manager for coordinating offline/online transitions
type SyncHandler = (item: OfflineItem) => Promise<boolean>;
type ConnectivityListener = (isOnline: boolean) => void;

class SyncManager {
  private isOnline = true;
  private isSyncing = false;
  private handlers: Map<string, SyncHandler> = new Map();
  private listeners: Set<ConnectivityListener> = new Set();

  setOnlineStatus(online: boolean): void {
    const wasOffline = !this.isOnline;
    this.isOnline = online;

    // Notify listeners
    this.listeners.forEach(listener => listener(online));

    // Auto-sync when coming back online
    if (wasOffline && online) {
      this.syncAll();
    }
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  registerHandler(entity: string, handler: SyncHandler): void {
    this.handlers.set(entity, handler);
  }

  addConnectivityListener(listener: ConnectivityListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async syncAll(): Promise<SyncResult> {
    if (this.isSyncing || !this.isOnline) {
      return { success: false, synced: 0, failed: 0, errors: ['Sync already in progress or offline'] };
    }

    this.isSyncing = true;
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [],
    };

    try {
      const pendingItems = await offlineQueue.getPendingItems();

      for (const item of pendingItems) {
        const handler = this.handlers.get(item.entity);

        if (!handler) {
          result.errors.push(`No handler for entity: ${item.entity}`);
          result.failed++;
          continue;
        }

        await offlineQueue.updateItem(item.id, { status: 'syncing' });

        try {
          const success = await handler(item);

          if (success) {
            await offlineQueue.removeFromQueue(item.id);
            result.synced++;
          } else {
            await offlineQueue.updateItem(item.id, {
              status: 'failed',
              retryCount: item.retryCount + 1,
              error: 'Sync failed',
            });
            result.failed++;
          }
        } catch (error) {
          await offlineQueue.updateItem(item.id, {
            status: 'failed',
            retryCount: item.retryCount + 1,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          result.failed++;
          result.errors.push(error instanceof Error ? error.message : 'Unknown error');
        }
      }

      result.success = result.failed === 0;
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  async syncItem(itemId: string): Promise<boolean> {
    if (!this.isOnline) return false;

    const queue = await offlineQueue.getQueue();
    const item = queue.find(i => i.id === itemId);

    if (!item) return false;

    const handler = this.handlers.get(item.entity);
    if (!handler) return false;

    try {
      const success = await handler(item);
      if (success) {
        await offlineQueue.removeFromQueue(itemId);
      }
      return success;
    } catch {
      return false;
    }
  }
}

export const syncManager = new SyncManager();

// Utility to check if data is stale
export function isDataStale(timestamp: number, maxAge: number): boolean {
  return Date.now() - timestamp > maxAge;
}

// Utility to generate cache key
export function generateCacheKey(...parts: (string | number)[]): string {
  return parts.join('_');
}
