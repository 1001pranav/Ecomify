/**
 * Analytics Tracking Service
 * Handles event tracking, screen views, and user analytics
 */

import { storage } from './storage';

// Event types
export type AnalyticsEventName =
  // User events
  | 'user_signup'
  | 'user_login'
  | 'user_logout'
  | 'user_profile_update'
  // Product events
  | 'product_view'
  | 'product_search'
  | 'product_share'
  | 'product_add_to_wishlist'
  | 'product_remove_from_wishlist'
  // Cart events
  | 'cart_add'
  | 'cart_remove'
  | 'cart_update_quantity'
  | 'cart_view'
  | 'cart_clear'
  // Checkout events
  | 'checkout_start'
  | 'checkout_add_shipping'
  | 'checkout_add_payment'
  | 'checkout_complete'
  | 'checkout_abandon'
  // Order events
  | 'order_view'
  | 'order_track'
  | 'order_reorder'
  // App events
  | 'app_open'
  | 'app_background'
  | 'app_error'
  | 'push_notification_open'
  | 'deep_link_open';

// Event properties
export interface AnalyticsEvent {
  name: AnalyticsEventName;
  properties?: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export interface ScreenViewEvent {
  screenName: string;
  screenClass?: string;
  properties?: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export interface UserProperties {
  userId: string;
  email?: string;
  name?: string;
  createdAt?: string;
  [key: string]: unknown;
}

// Analytics configuration
interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  batchSize: number;
  flushInterval: number;
}

// Analytics service
class AnalyticsService {
  private config: AnalyticsConfig = {
    enabled: true,
    debug: __DEV__ || false,
    batchSize: 10,
    flushInterval: 30000, // 30 seconds
  };

  private sessionId: string;
  private userId: string | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private screenViewQueue: ScreenViewEvent[] = [];
  private userProperties: UserProperties | null = null;
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
  }

  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  // Configure analytics
  configure(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.config.flushInterval !== config.flushInterval) {
      this.startFlushTimer();
    }
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    storage.set('analytics_enabled', enabled);
  }

  async isEnabled(): Promise<boolean> {
    const stored = await storage.get<boolean>('analytics_enabled');
    return stored !== false; // Default to enabled
  }

  // Identify user
  identify(userId: string, properties?: Omit<UserProperties, 'userId'>): void {
    this.userId = userId;
    this.userProperties = {
      userId,
      ...properties,
    };

    if (this.config.debug) {
      console.log('[Analytics] Identify:', userId, properties);
    }

    // Would send to analytics provider here
  }

  // Reset user (on logout)
  reset(): void {
    this.userId = null;
    this.userProperties = null;
    this.sessionId = this.generateSessionId();
    this.eventQueue = [];
    this.screenViewQueue = [];
  }

  // Track event
  track(name: AnalyticsEventName, properties?: Record<string, unknown>): void {
    if (!this.config.enabled) return;

    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    };

    this.eventQueue.push(event);

    if (this.config.debug) {
      console.log('[Analytics] Track:', name, properties);
    }

    // Auto-flush if batch size reached
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  // Track screen view
  trackScreen(screenName: string, properties?: Record<string, unknown>): void {
    if (!this.config.enabled) return;

    const screenView: ScreenViewEvent = {
      screenName,
      properties,
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    };

    this.screenViewQueue.push(screenView);

    if (this.config.debug) {
      console.log('[Analytics] Screen:', screenName, properties);
    }
  }

  // Flush events to analytics provider
  async flush(): Promise<void> {
    if (!this.config.enabled) return;
    if (this.eventQueue.length === 0 && this.screenViewQueue.length === 0) return;

    const events = [...this.eventQueue];
    const screenViews = [...this.screenViewQueue];

    this.eventQueue = [];
    this.screenViewQueue = [];

    try {
      // Would batch send to analytics provider here
      // e.g., Firebase Analytics, Amplitude, Mixpanel, etc.
      if (this.config.debug) {
        console.log('[Analytics] Flush:', {
          events: events.length,
          screenViews: screenViews.length,
        });
      }
    } catch (error) {
      // Re-queue failed events
      this.eventQueue = [...events, ...this.eventQueue];
      this.screenViewQueue = [...screenViews, ...this.screenViewQueue];

      if (this.config.debug) {
        console.error('[Analytics] Flush failed:', error);
      }
    }
  }

  // E-commerce specific tracking methods
  trackProductView(product: { id: string; title: string; price: number; category?: string }): void {
    this.track('product_view', {
      product_id: product.id,
      product_name: product.title,
      price: product.price,
      category: product.category,
    });
  }

  trackAddToCart(item: { productId: string; variantId: string; title: string; price: number; quantity: number }): void {
    this.track('cart_add', {
      product_id: item.productId,
      variant_id: item.variantId,
      product_name: item.title,
      price: item.price,
      quantity: item.quantity,
      value: item.price * item.quantity,
    });
  }

  trackRemoveFromCart(item: { productId: string; variantId: string; title: string; price: number; quantity: number }): void {
    this.track('cart_remove', {
      product_id: item.productId,
      variant_id: item.variantId,
      product_name: item.title,
      price: item.price,
      quantity: item.quantity,
    });
  }

  trackCheckoutStart(cart: { items: number; total: number }): void {
    this.track('checkout_start', {
      items_count: cart.items,
      cart_value: cart.total,
    });
  }

  trackPurchase(order: {
    orderId: string;
    total: number;
    subtotal: number;
    shipping: number;
    tax: number;
    items: number;
    paymentMethod: string;
  }): void {
    this.track('checkout_complete', {
      order_id: order.orderId,
      value: order.total,
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: order.tax,
      items_count: order.items,
      payment_method: order.paymentMethod,
      currency: 'USD',
    });
  }

  trackSearch(query: string, resultsCount: number): void {
    this.track('product_search', {
      search_term: query,
      results_count: resultsCount,
    });
  }

  trackError(error: Error, context?: Record<string, unknown>): void {
    this.track('app_error', {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }

  // Cleanup
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

export const analytics = new AnalyticsService();

// React Navigation screen tracking helper
export function createScreenTracker() {
  let currentRouteName: string | undefined;

  return {
    onStateChange: (state: { routes: { name: string }[]; index: number } | undefined) => {
      if (!state) return;

      const route = state.routes[state.index];
      const routeName = route?.name;

      if (routeName && routeName !== currentRouteName) {
        currentRouteName = routeName;
        analytics.trackScreen(routeName);
      }
    },
  };
}
