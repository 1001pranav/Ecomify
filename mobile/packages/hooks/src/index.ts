/**
 * Shared Hooks Package
 * Custom React hooks for Ecomify Mobile Apps
 */

export { useProducts, useProduct, useProductSearch, useInfiniteProducts } from './useProducts';
export { useOrders, useOrder, useInfiniteOrders } from './useOrders';
export { useDebounce } from './useDebounce';
export { useNetworkStatus, useIsOnline, useOfflineSync } from './useNetworkStatus';
export { useRefreshOnFocus } from './useRefreshOnFocus';
export {
  useNotificationRegistration,
  useNotificationSettings,
  useNotificationListener,
  useNotificationHistory,
  notificationService,
  getNotificationAction,
} from './notifications';
export type {
  PushNotification,
  NotificationType,
  NotificationSettings,
  NotificationPermissions,
} from './notifications';
