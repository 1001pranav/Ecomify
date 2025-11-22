/**
 * Checkout Types
 * Type definitions for checkout flow
 */

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: string;
}

export interface PaymentInfo {
  cardLastFour: string;
  cardBrand: string;
  paymentIntentId?: string;
}

export interface CheckoutData {
  // Step 1: Information
  email: string;
  phone?: string;
  shippingAddress: ShippingAddress;
  saveInfo?: boolean;

  // Step 2: Shipping
  shippingMethod: ShippingMethod;

  // Step 3: Payment
  billingAddress?: ShippingAddress;
  sameAsShipping?: boolean;
  paymentInfo?: PaymentInfo;
}

export interface Order {
  id: string;
  orderNumber: string;
  email: string;
  phone?: string;
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  status: OrderStatus;
  financialStatus: FinancialStatus;
  fulfillmentStatus: FulfillmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  title: string;
  variantTitle?: string;
  price: number;
  quantity: number;
  image?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type FinancialStatus = 'pending' | 'paid' | 'refunded' | 'partially_refunded';
export type FulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled';
