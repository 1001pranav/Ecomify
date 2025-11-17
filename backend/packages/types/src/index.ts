/**
 * Shared TypeScript types for Ecomify microservices
 * Following Design Pattern: Type-safe interfaces and enums
 */

// Common Enums
export enum Role {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  MERCHANT = 'MERCHANT',
  STORE_STAFF = 'STORE_STAFF',
  CUSTOMER = 'CUSTOMER',
}

export enum StoreStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum FinancialStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  PAID = 'PAID',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  REFUNDED = 'REFUNDED',
  VOIDED = 'VOIDED',
}

export enum FulfillmentStatus {
  UNFULFILLED = 'UNFULFILLED',
  PARTIALLY_FULFILLED = 'PARTIALLY_FULFILLED',
  FULFILLED = 'FULFILLED',
}

export enum TransactionType {
  AUTHORIZATION = 'AUTHORIZATION',
  CAPTURE = 'CAPTURE',
  SALE = 'SALE',
  REFUND = 'REFUND',
  VOID = 'VOID',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

// Common Interfaces
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  email: string;
  status: StoreStatus;
  currency: string;
  locale: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  country: string;
  zip: string;
  phone?: string;
}

// Event Types
export interface BaseEvent {
  eventId: string;
  eventType: string;
  timestamp: Date;
  version: string;
  metadata?: Record<string, any>;
}

export interface UserCreatedEvent extends BaseEvent {
  eventType: 'user.created';
  data: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface StoreCreatedEvent extends BaseEvent {
  eventType: 'store.created';
  data: {
    storeId: string;
    ownerId: string;
    name: string;
    slug: string;
  };
}

export interface ProductCreatedEvent extends BaseEvent {
  eventType: 'product.created';
  data: {
    productId: string;
    storeId: string;
    title: string;
    handle: string;
  };
}

export interface OrderCreatedEvent extends BaseEvent {
  eventType: 'order.created';
  data: {
    orderId: string;
    orderNumber: string;
    storeId: string;
    customerId?: string;
    totalPrice: number;
    currency: string;
  };
}

export interface PaymentProcessedEvent extends BaseEvent {
  eventType: 'payment.processed';
  data: {
    transactionId: string;
    orderId: string;
    amount: number;
    currency: string;
    status: TransactionStatus;
  };
}

export interface InventoryUpdatedEvent extends BaseEvent {
  eventType: 'inventory.updated';
  data: {
    variantId: string;
    locationId: string;
    available: number;
    committed: number;
  };
}

export type DomainEvent =
  | UserCreatedEvent
  | StoreCreatedEvent
  | ProductCreatedEvent
  | OrderCreatedEvent
  | PaymentProcessedEvent
  | InventoryUpdatedEvent;

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Configuration Types
export interface DatabaseConfig {
  url: string;
  replicaUrl?: string;
  maxConnections?: number;
  connectionTimeout?: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export interface RabbitMQConfig {
  url: string;
  exchanges?: string[];
  queues?: string[];
  prefetch?: number;
}

export interface JWTConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

// Export all types
export * from './errors';
export * from './validators';
