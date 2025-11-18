/**
 * Mock Factories - Factory Pattern for creating test data
 */

/**
 * Factory interface for creating test objects
 * Factory Pattern: Defines the interface for creating mock objects
 */
export interface MockFactory<T> {
  create(overrides?: Partial<T>): T;
  createMany(count: number, overrides?: Partial<T>): T[];
}

/**
 * Abstract factory for creating mocks
 * Implements common functionality for all factories
 */
export abstract class AbstractMockFactory<T> implements MockFactory<T> {
  abstract createDefault(): T;

  create(overrides?: Partial<T>): T {
    return {
      ...this.createDefault(),
      ...overrides,
    };
  }

  createMany(count: number, overrides?: Partial<T>): T[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

/**
 * User Mock Factory
 */
export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isVerified: boolean;
}

export class UserMockFactory extends AbstractMockFactory<MockUser> {
  createDefault(): MockUser {
    const id = `user_${Date.now()}`;
    return {
      id,
      email: `test-${id}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      roles: ['CUSTOMER'],
      isVerified: true,
    };
  }

  createMerchant(overrides?: Partial<MockUser>): MockUser {
    return this.create({
      roles: ['MERCHANT'],
      ...overrides,
    });
  }

  createAdmin(overrides?: Partial<MockUser>): MockUser {
    return this.create({
      roles: ['PLATFORM_ADMIN'],
      ...overrides,
    });
  }
}

/**
 * Store Mock Factory
 */
export interface MockStore {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  domain: string;
  email: string;
  currency: string;
  status: string;
}

export class StoreMockFactory extends AbstractMockFactory<MockStore> {
  createDefault(): MockStore {
    const id = `store_${Date.now()}`;
    return {
      id,
      ownerId: `user_${Date.now()}`,
      name: 'Test Store',
      slug: `test-store-${Date.now()}`,
      domain: `test-store-${Date.now()}.ecomify.com`,
      email: `store-${id}@example.com`,
      currency: 'USD',
      status: 'ACTIVE',
    };
  }
}

/**
 * Product Mock Factory
 */
export interface MockProduct {
  id: string;
  storeId: string;
  title: string;
  description: string;
  handle: string;
  status: string;
  variants: MockProductVariant[];
}

export interface MockProductVariant {
  id: string;
  productId: string;
  sku: string;
  title: string;
  price: number;
  inventoryQty: number;
}

export class ProductMockFactory extends AbstractMockFactory<MockProduct> {
  createDefault(): MockProduct {
    const id = `product_${Date.now()}`;
    return {
      id,
      storeId: `store_${Date.now()}`,
      title: 'Test Product',
      description: 'Test product description',
      handle: `test-product-${Date.now()}`,
      status: 'ACTIVE',
      variants: [
        {
          id: `variant_${Date.now()}`,
          productId: id,
          sku: `SKU-${Date.now()}`,
          title: 'Default Variant',
          price: 99.99,
          inventoryQty: 100,
        },
      ],
    };
  }
}

/**
 * Order Mock Factory
 */
export interface MockOrder {
  id: string;
  orderNumber: string;
  storeId: string;
  customerId: string;
  email: string;
  subtotalPrice: number;
  totalPrice: number;
  currency: string;
  financialStatus: string;
  fulfillmentStatus: string;
  lineItems: MockOrderLineItem[];
}

export interface MockOrderLineItem {
  id: string;
  orderId: string;
  variantId: string;
  title: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export class OrderMockFactory extends AbstractMockFactory<MockOrder> {
  createDefault(): MockOrder {
    const id = `order_${Date.now()}`;
    const subtotal = 199.98;
    return {
      id,
      orderNumber: `ORD-${Date.now()}`,
      storeId: `store_${Date.now()}`,
      customerId: `customer_${Date.now()}`,
      email: `customer-${id}@example.com`,
      subtotalPrice: subtotal,
      totalPrice: subtotal + subtotal * 0.1, // Add 10% tax
      currency: 'USD',
      financialStatus: 'PENDING',
      fulfillmentStatus: 'UNFULFILLED',
      lineItems: [
        {
          id: `line_item_${Date.now()}`,
          orderId: id,
          variantId: `variant_${Date.now()}`,
          title: 'Test Product',
          quantity: 2,
          price: 99.99,
          totalPrice: 199.98,
        },
      ],
    };
  }
}

/**
 * Export factory instances
 */
export const mockFactories = {
  user: new UserMockFactory(),
  store: new StoreMockFactory(),
  product: new ProductMockFactory(),
  order: new OrderMockFactory(),
};
