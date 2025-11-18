import { Address, Money } from './common';
import { ProductVariant } from './product';

export type OrderFinancialStatus = 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'voided';
export type OrderFulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'cancelled';

export interface Order {
  id: string;
  storeId: string;
  orderNumber: string;
  email: string;
  phone?: string;
  customerId?: string;
  financialStatus: OrderFinancialStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  lineItems: LineItem[];
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod?: string;
  subtotalPrice: number;
  totalShipping: number;
  totalTax: number;
  totalDiscount: number;
  totalPrice: number;
  currency: string;
  note?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LineItem {
  id: string;
  orderId: string;
  variantId: string;
  productId: string;
  title: string;
  variantTitle: string;
  sku?: string;
  quantity: number;
  price: number;
  totalPrice: number;
  image?: string;
  fulfillableQuantity: number;
}

export interface OrderFilters {
  search?: string;
  financialStatus?: OrderFinancialStatus;
  fulfillmentStatus?: OrderFulfillmentStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface FulfillmentInput {
  lineItems: {
    lineItemId: string;
    quantity: number;
  }[];
  trackingNumber?: string;
  carrier?: string;
  notifyCustomer: boolean;
}
