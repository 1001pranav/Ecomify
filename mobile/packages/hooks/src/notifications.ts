/**
 * Push Notification Hooks and Service
 * Handles push notification registration, handling, and display
 */

import { useEffect, useCallback, useState } from 'react';
import { storage } from '@ecomify/core';

// Notification types
export type NotificationType =
  | 'order_status'
  | 'order_shipped'
  | 'order_delivered'
  | 'promotion'
  | 'price_drop'
  | 'back_in_stock'
  | 'abandoned_cart'
  | 'new_message'
  | 'general';

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: {
    type: NotificationType;
    deepLink?: string;
    orderId?: string;
    productId?: string;
    [key: string]: unknown;
  };
  timestamp: number;
  read: boolean;
}

export interface NotificationPermissions {
  granted: boolean;
  canAskAgain: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  priceDrops: boolean;
  backInStock: boolean;
}

// Storage keys
const NOTIFICATION_TOKEN_KEY = 'push_notification_token';
const NOTIFICATION_SETTINGS_KEY = 'notification_settings';
const NOTIFICATIONS_HISTORY_KEY = 'notifications_history';

// Default notification settings
const defaultSettings: NotificationSettings = {
  enabled: true,
  orderUpdates: true,
  promotions: false,
  priceDrops: true,
  backInStock: true,
};

// Notification service class
class NotificationService {
  private token: string | null = null;
  private listeners: Set<(notification: PushNotification) => void> = new Set();

  // Register for push notifications
  async register(): Promise<string | null> {
    // This would use expo-notifications in real implementation
    // const { status: existingStatus } = await Notifications.getPermissionsAsync();
    // let finalStatus = existingStatus;
    //
    // if (existingStatus !== 'granted') {
    //   const { status } = await Notifications.requestPermissionsAsync();
    //   finalStatus = status;
    // }
    //
    // if (finalStatus !== 'granted') {
    //   return null;
    // }
    //
    // const token = (await Notifications.getExpoPushTokenAsync()).data;

    // Mock token for development
    const mockToken = `ExponentPushToken[${Date.now()}]`;
    this.token = mockToken;

    await storage.set(NOTIFICATION_TOKEN_KEY, mockToken);

    return mockToken;
  }

  // Get stored token
  async getToken(): Promise<string | null> {
    if (this.token) return this.token;

    const storedToken = await storage.get<string>(NOTIFICATION_TOKEN_KEY);
    this.token = storedToken;
    return storedToken;
  }

  // Check permission status
  async checkPermissions(): Promise<NotificationPermissions> {
    // This would use expo-notifications
    // const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    return {
      granted: true, // Mock
      canAskAgain: true,
    };
  }

  // Request permissions
  async requestPermissions(): Promise<boolean> {
    // const { status } = await Notifications.requestPermissionsAsync();
    // return status === 'granted';
    return true; // Mock
  }

  // Get notification settings
  async getSettings(): Promise<NotificationSettings> {
    const settings = await storage.get<NotificationSettings>(NOTIFICATION_SETTINGS_KEY);
    return settings || defaultSettings;
  }

  // Update notification settings
  async updateSettings(updates: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...updates };
    await storage.set(NOTIFICATION_SETTINGS_KEY, updated);
    return updated;
  }

  // Add notification listener
  addListener(callback: (notification: PushNotification) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Handle incoming notification
  handleNotification(notification: PushNotification): void {
    this.listeners.forEach(listener => listener(notification));
    this.addToHistory(notification);
  }

  // Get notification history
  async getHistory(): Promise<PushNotification[]> {
    const history = await storage.get<PushNotification[]>(NOTIFICATIONS_HISTORY_KEY);
    return history || [];
  }

  // Add to history
  private async addToHistory(notification: PushNotification): Promise<void> {
    const history = await this.getHistory();
    const updated = [notification, ...history].slice(0, 100); // Keep last 100
    await storage.set(NOTIFICATIONS_HISTORY_KEY, updated);
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const history = await this.getHistory();
    const updated = history.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    await storage.set(NOTIFICATIONS_HISTORY_KEY, updated);
  }

  // Mark all as read
  async markAllAsRead(): Promise<void> {
    const history = await this.getHistory();
    const updated = history.map(n => ({ ...n, read: true }));
    await storage.set(NOTIFICATIONS_HISTORY_KEY, updated);
  }

  // Clear history
  async clearHistory(): Promise<void> {
    await storage.remove(NOTIFICATIONS_HISTORY_KEY);
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const history = await this.getHistory();
    return history.filter(n => !n.read).length;
  }

  // Schedule local notification
  async scheduleLocal(notification: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
    trigger?: { seconds: number } | { date: Date };
  }): Promise<string> {
    // This would use expo-notifications
    // return await Notifications.scheduleNotificationAsync({
    //   content: {
    //     title: notification.title,
    //     body: notification.body,
    //     data: notification.data,
    //   },
    //   trigger: notification.trigger,
    // });
    return `local_${Date.now()}`; // Mock
  }

  // Cancel scheduled notification
  async cancelScheduled(notificationId: string): Promise<void> {
    // await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Cancel all scheduled notifications
  async cancelAllScheduled(): Promise<void> {
    // await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export const notificationService = new NotificationService();

// React hooks

// Hook to register for push notifications
export function useNotificationRegistration() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const register = async () => {
      try {
        const existingToken = await notificationService.getToken();
        if (existingToken) {
          setToken(existingToken);
          setLoading(false);
          return;
        }

        const newToken = await notificationService.register();
        setToken(newToken);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to register');
      } finally {
        setLoading(false);
      }
    };

    register();
  }, []);

  const reregister = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newToken = await notificationService.register();
      setToken(newToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  }, []);

  return { token, loading, error, reregister };
}

// Hook to manage notification settings
export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService.getSettings().then(s => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const updateSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    const updated = await notificationService.updateSettings(updates);
    setSettings(updated);
    return updated;
  }, []);

  return { settings, loading, updateSettings };
}

// Hook to listen for notifications
export function useNotificationListener(
  onNotification: (notification: PushNotification) => void
) {
  useEffect(() => {
    return notificationService.addListener(onNotification);
  }, [onNotification]);
}

// Hook for notification history
export function useNotificationHistory() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [history, count] = await Promise.all([
      notificationService.getHistory(),
      notificationService.getUnreadCount(),
    ]);
    setNotifications(history);
    setUnreadCount(count);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));

    // Listen for new notifications
    return notificationService.addListener(() => {
      refresh();
    });
  }, [refresh]);

  const markAsRead = useCallback(async (id: string) => {
    await notificationService.markAsRead(id);
    refresh();
  }, [refresh]);

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead();
    refresh();
  }, [refresh]);

  const clearAll = useCallback(async () => {
    await notificationService.clearHistory();
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    refresh,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}

// Utility to handle notification action
export function getNotificationAction(notification: PushNotification): {
  screen: string;
  params: Record<string, string>;
} | null {
  if (!notification.data) return null;

  const { type, orderId, productId, deepLink } = notification.data;

  switch (type) {
    case 'order_status':
    case 'order_shipped':
    case 'order_delivered':
      if (orderId) {
        return { screen: 'OrderDetail', params: { orderId: orderId as string } };
      }
      return { screen: 'Orders', params: {} };

    case 'price_drop':
    case 'back_in_stock':
      if (productId) {
        return { screen: 'ProductDetail', params: { productId: productId as string } };
      }
      return { screen: 'Shop', params: {} };

    case 'abandoned_cart':
      return { screen: 'Cart', params: {} };

    case 'promotion':
      return { screen: 'Shop', params: {} };

    default:
      if (deepLink) {
        // Parse deep link and return appropriate screen
      }
      return null;
  }
}
