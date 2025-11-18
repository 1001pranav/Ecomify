// User & Authentication Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'customer' | 'merchant' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Product Types
export interface Product {
  id: string;
  title: string;
  description?: string;
  handle: string;
  status: 'draft' | 'active' | 'archived';
  variants: ProductVariant[];
  images: ProductImage[];
  options: ProductOption[];
  categoryId?: string;
  tags: string[];
  price: number;
  compareAtPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  title: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  inventoryQty: number;
  options: Record<string, string>;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  position: number;
}

export interface ProductOption {
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
  fulfillmentStatus: 'unfulfilled' | 'fulfilled' | 'partially_fulfilled';
  lineItems: OrderLineItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  subtotalPrice: number;
  totalShipping: number;
  totalTax: number;
  totalPrice: number;
  totalDiscount: number;
  discountCodes: string[];
  paymentIntentId?: string;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderLineItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  sku?: string;
  quantity: number;
  price: number;
  totalPrice: number;
  image?: string;
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

// Customer Types
export interface Customer extends User {
  totalOrders: number;
  totalSpent: number;
  tags: string[];
  addresses: Address[];
}

// Cart Types
export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  variantTitle: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Cart {
  items: CartItem[];
  discountCode?: string;
}

// Analytics Types
export interface DashboardMetrics {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  customers: number;
  customersChange: number;
  avgOrderValue: number;
  avgOrderValueChange: number;
  salesData: TimeSeriesData[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// Filter & Query Types
export interface ProductFilters {
  search?: string;
  status?: string;
  categoryId?: string;
  tags?: string[];
  sort?: string;
  page?: number;
  limit?: number;
}

export interface OrderFilters {
  search?: string;
  financialStatus?: string;
  fulfillmentStatus?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

// Theme Types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  logo?: string;
}

// Store Types
export interface Store {
  id: string;
  name: string;
  domain: string;
  email: string;
  currency: string;
  timezone: string;
  theme: ThemeConfig;
  settings: StoreSettings;
}

export interface StoreSettings {
  checkoutSettings: {
    requireAccount: boolean;
    allowGuestCheckout: boolean;
  };
  shippingSettings: {
    zones: ShippingZone[];
  };
  taxSettings: {
    includeTax: boolean;
    taxRate: number;
  };
  paymentGateways: PaymentGateway[];
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  rates: ShippingRate[];
}

export interface ShippingRate {
  id: string;
  name: string;
  price: number;
  estimatedDays?: string;
}

export interface PaymentGateway {
  id: string;
  type: 'stripe' | 'paypal' | 'square';
  enabled: boolean;
  credentials: Record<string, string>;
}

// Fulfillment Types
export interface FulfillmentData {
  lineItems: {
    lineItemId: string;
    quantity: number;
  }[];
  trackingNumber?: string;
  carrier?: string;
  notifyCustomer: boolean;
}

// Checkout Types
export interface CheckoutData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingRate?: number;
  shippingMethod?: string;
  tax?: number;
  discountCode?: string;
}
