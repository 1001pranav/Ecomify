/**
 * Shared Types Package
 * Type definitions for Ecomify Mobile Apps
 */

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'merchant' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  provinceCode: string;
  country: string;
  countryCode: string;
  zip: string;
  phone?: string;
  isDefault: boolean;
}

// Product Types
export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor?: string;
  productType?: string;
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  images: ProductImage[];
  variants: ProductVariant[];
  options: ProductOption[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  position: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  options: Record<string, string>;
  image?: ProductImage;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  email: string;
  phone?: string;
  financialStatus: 'pending' | 'paid' | 'refunded' | 'partially_refunded';
  fulfillmentStatus: 'unfulfilled' | 'fulfilled' | 'partial' | 'restocked';
  lineItems: LineItem[];
  shippingAddress?: Address;
  billingAddress?: Address;
  subtotalPrice: number;
  totalShipping: number;
  totalTax: number;
  totalPrice: number;
  totalDiscount: number;
  currency: string;
  note?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LineItem {
  id: string;
  title: string;
  variantTitle?: string;
  sku?: string;
  quantity: number;
  price: number;
  totalDiscount: number;
  image?: string;
  productId: string;
  variantId: string;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  variantTitle?: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
  discountCode?: string;
  discountAmount: number;
}

// Analytics Types
export interface DashboardMetrics {
  todaySales: number;
  yesterdaySales: number;
  weekSales: number;
  monthSales: number;
  orders: number;
  visitors: number;
  conversionRate: number;
  averageOrderValue: number;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, string[]>;
}

// Auth Types
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Checkout Types
export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface CheckoutData {
  email: string;
  shippingAddress: Address;
  billingAddress?: Address;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  note?: string;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'order' | 'promo' | 'system';
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

// Filter & Sort Types
export interface ProductFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  tags?: string[];
  inStock?: boolean;
}

export interface OrderFilters {
  status?: string;
  fulfillmentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: string;
  direction: SortDirection;
}
