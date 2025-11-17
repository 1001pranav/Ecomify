/**
 * Queue Factory - Factory Pattern
 *
 * Factory for creating publishers and consumers with predefined configurations
 */

import { EventPublisher, createPublisher } from './publisher';
import { EventConsumer, createConsumer } from './consumer';
import { PublisherOptions, ConsumerOptions } from '../types';

/**
 * Queue configuration for different exchanges
 */
export enum QueueExchange {
  EVENTS = 'ecomify.events',
  COMMANDS = 'ecomify.commands',
  NOTIFICATIONS = 'ecomify.notifications',
  DEAD_LETTER = 'ecomify.dlx',
}

/**
 * Queue name conventions
 */
export enum QueueName {
  // Auth Service
  AUTH_EVENTS = 'auth-service.events',

  // Store Service
  STORE_EVENTS = 'store-service.events',

  // Product Service
  PRODUCT_EVENTS = 'product-service.events',
  PRODUCT_INDEXING = 'product-service.indexing',

  // Order Service
  ORDER_EVENTS = 'order-service.events',
  ORDER_PROCESSING = 'order-service.processing',

  // Payment Service
  PAYMENT_EVENTS = 'payment-service.events',
  PAYMENT_PROCESSING = 'payment-service.processing',

  // Inventory Service
  INVENTORY_EVENTS = 'inventory-service.events',
  INVENTORY_UPDATES = 'inventory-service.updates',

  // Customer Service
  CUSTOMER_EVENTS = 'customer-service.events',

  // Analytics Service
  ANALYTICS_EVENTS = 'analytics-service.events',

  // Notification Service
  NOTIFICATION_EVENTS = 'notification-service.events',
  NOTIFICATION_DELIVERY = 'notification-service.delivery',

  // Email Service
  EMAIL_DELIVERY = 'email-service.delivery',

  // Dead Letter Queue
  DLQ = 'dead-letter-queue',
}

/**
 * Event routing keys
 */
export enum EventRoute {
  // User events
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',

  // Store events
  STORE_CREATED = 'store.created',
  STORE_UPDATED = 'store.updated',
  STORE_STATUS_CHANGED = 'store.status.changed',

  // Product events
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',

  // Order events
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_CANCELLED = 'order.cancelled',
  ORDER_FULFILLED = 'order.fulfilled',

  // Payment events
  PAYMENT_PROCESSED = 'payment.processed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_REFUNDED = 'payment.refunded',

  // Inventory events
  INVENTORY_UPDATED = 'inventory.updated',
  INVENTORY_LOW_STOCK = 'inventory.low_stock',

  // Customer events
  CUSTOMER_CREATED = 'customer.created',
  CUSTOMER_UPDATED = 'customer.updated',

  // Notification events
  NOTIFICATION_SEND = 'notification.send',
  NOTIFICATION_DELIVERED = 'notification.delivered',
  NOTIFICATION_FAILED = 'notification.failed',
}

/**
 * Queue Factory class implementing Factory Pattern
 */
export class QueueFactory {
  private static publishers: Map<string, EventPublisher> = new Map();
  private static consumers: Map<string, EventConsumer> = new Map();

  /**
   * Create or get event publisher
   */
  public static createEventPublisher(
    exchange: QueueExchange = QueueExchange.EVENTS,
    options?: Partial<PublisherOptions>,
  ): EventPublisher {
    const key = exchange;

    if (this.publishers.has(key)) {
      return this.publishers.get(key)!;
    }

    const publisher = createPublisher({
      exchange,
      exchangeType: 'topic',
      durable: true,
      ...options,
    });

    this.publishers.set(key, publisher);
    return publisher;
  }

  /**
   * Create or get command publisher
   */
  public static createCommandPublisher(
    options?: Partial<PublisherOptions>,
  ): EventPublisher {
    return this.createEventPublisher(QueueExchange.COMMANDS, options);
  }

  /**
   * Create or get notification publisher
   */
  public static createNotificationPublisher(
    options?: Partial<PublisherOptions>,
  ): EventPublisher {
    return this.createEventPublisher(QueueExchange.NOTIFICATIONS, options);
  }

  /**
   * Create event consumer
   */
  public static createEventConsumer(
    queueName: QueueName,
    routingKey: string,
    options?: Partial<ConsumerOptions>,
  ): EventConsumer {
    const key = `${queueName}-${routingKey}`;

    if (this.consumers.has(key)) {
      return this.consumers.get(key)!;
    }

    const consumer = createConsumer({
      queue: queueName,
      exchange: QueueExchange.EVENTS,
      routingKey,
      prefetch: 10,
      autoAck: false,
      ...options,
    });

    this.consumers.set(key, consumer);
    return consumer;
  }

  /**
   * Create service-specific consumer
   */
  public static createServiceConsumer(
    serviceName: string,
    routingPattern: string,
    options?: Partial<ConsumerOptions>,
  ): EventConsumer {
    const queueName = `${serviceName}.events` as QueueName;
    return this.createEventConsumer(queueName, routingPattern, options);
  }

  /**
   * Create dead letter queue consumer
   */
  public static createDLQConsumer(
    options?: Partial<ConsumerOptions>,
  ): EventConsumer {
    return createConsumer({
      queue: QueueName.DLQ,
      exchange: QueueExchange.DEAD_LETTER,
      routingKey: '#',
      prefetch: 1,
      autoAck: false,
      ...options,
    });
  }

  /**
   * Initialize all publishers and consumers
   */
  public static async initializeAll(): Promise<void> {
    // Initialize all publishers
    for (const publisher of this.publishers.values()) {
      await publisher.initialize();
    }

    // Initialize all consumers
    for (const consumer of this.consumers.values()) {
      await consumer.initialize();
      await consumer.start();
    }

    console.log('✓ All publishers and consumers initialized');
  }

  /**
   * Close all publishers and consumers
   */
  public static async closeAll(): Promise<void> {
    // Close all publishers
    for (const publisher of this.publishers.values()) {
      await publisher.close();
    }

    // Close all consumers
    for (const consumer of this.consumers.values()) {
      await consumer.close();
    }

    this.publishers.clear();
    this.consumers.clear();

    console.log('✓ All publishers and consumers closed');
  }

  /**
   * Get all active publishers
   */
  public static getPublishers(): Map<string, EventPublisher> {
    return this.publishers;
  }

  /**
   * Get all active consumers
   */
  public static getConsumers(): Map<string, EventConsumer> {
    return this.consumers;
  }
}

/**
 * Helper function to create a simple event publisher
 */
export async function setupEventPublisher(
  serviceName: string,
): Promise<EventPublisher> {
  const publisher = QueueFactory.createEventPublisher();
  await publisher.initialize();
  return publisher;
}

/**
 * Helper function to create a simple event consumer
 */
export async function setupEventConsumer(
  serviceName: string,
  routingPattern: string = '#',
): Promise<EventConsumer> {
  const consumer = QueueFactory.createServiceConsumer(serviceName, routingPattern);
  await consumer.initialize();
  return consumer;
}
