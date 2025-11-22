/**
 * App Constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.API_URL || 'https://api.ecomify.store',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PRODUCTS_PER_PAGE: 20,
  ORDERS_PER_PAGE: 15,
  REVIEWS_PER_PAGE: 10,
};

// Image Configuration
export const IMAGE_CONFIG = {
  THUMBNAIL_SIZE: 150,
  MEDIUM_SIZE: 400,
  LARGE_SIZE: 800,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

// Cache Configuration
export const CACHE_CONFIG = {
  PRODUCTS_STALE_TIME: 5 * 60 * 1000, // 5 minutes
  ORDERS_STALE_TIME: 1 * 60 * 1000, // 1 minute
  USER_STALE_TIME: 10 * 60 * 1000, // 10 minutes
  ANALYTICS_STALE_TIME: 30 * 1000, // 30 seconds
};

// Cart
export const CART_CONFIG = {
  MAX_QUANTITY: 99,
  MIN_QUANTITY: 1,
};

// Search
export const SEARCH_CONFIG = {
  DEBOUNCE_MS: 300,
  MIN_QUERY_LENGTH: 2,
  MAX_HISTORY_ITEMS: 10,
  MAX_SUGGESTIONS: 5,
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export const FULFILLMENT_STATUS = {
  UNFULFILLED: 'unfulfilled',
  PARTIAL: 'partial',
  FULFILLED: 'fulfilled',
  RESTOCKED: 'restocked',
} as const;

export const FINANCIAL_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
} as const;

// Colors for status badges
export const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#8b5cf6',
  shipped: '#06b6d4',
  delivered: '#10b981',
  cancelled: '#ef4444',
  refunded: '#6b7280',
  unfulfilled: '#f59e0b',
  partial: '#8b5cf6',
  fulfilled: '#10b981',
  restocked: '#6b7280',
  paid: '#10b981',
  partially_refunded: '#f59e0b',
} as const;

// Animation Durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Layout
export const LAYOUT = {
  SCREEN_PADDING: 16,
  CARD_PADDING: 12,
  BORDER_RADIUS: 8,
  BORDER_RADIUS_LG: 12,
};

// Recently Viewed
export const RECENTLY_VIEWED = {
  MAX_ITEMS: 10,
};
