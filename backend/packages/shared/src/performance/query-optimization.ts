/**
 * Query Optimization Utilities
 * Performance optimization for database queries
 */

/**
 * Pagination helper - improves query performance
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class QueryOptimizer {
  /**
   * Create pagination parameters for Prisma
   */
  static getPaginationParams(options: PaginationOptions) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    return {
      skip,
      take: limit,
    };
  }

  /**
   * Build pagination result
   */
  static buildPaginationResult<T>(
    data: T[],
    total: number,
    options: PaginationOptions
  ): PaginationResult<T> {
    const { page, limit } = options;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Generate optimized select fields
   * Reduces payload size by selecting only needed fields
   */
  static selectFields<T>(fields: (keyof T)[]): Record<string, boolean> {
    return fields.reduce((acc, field) => {
      acc[field as string] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }

  /**
   * Build efficient where clause with indexing hints
   */
  static buildWhereClause(filters: Record<string, any>): Record<string, any> {
    const where: Record<string, any> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Handle different filter types
        if (Array.isArray(value)) {
          where[key] = { in: value };
        } else if (typeof value === 'object' && value.min !== undefined) {
          where[key] = { gte: value.min, lte: value.max };
        } else {
          where[key] = value;
        }
      }
    });

    return where;
  }
}

/**
 * Database indexing recommendations
 */
export const IndexingRecommendations = {
  // Store Service
  stores: [
    'CREATE INDEX idx_stores_owner_id ON "Store"(owner_id);',
    'CREATE INDEX idx_stores_slug ON "Store"(slug);',
    'CREATE INDEX idx_stores_status ON "Store"(status);',
  ],

  // Product Service
  products: [
    'CREATE INDEX idx_products_store_id ON "Product"(store_id);',
    'CREATE INDEX idx_products_status ON "Product"(status);',
    'CREATE INDEX idx_products_handle ON "Product"(handle);',
    'CREATE INDEX idx_products_created_at ON "Product"(created_at);',
    'CREATE INDEX idx_product_variants_sku ON "ProductVariant"(sku);',
    'CREATE INDEX idx_product_variants_product_id ON "ProductVariant"(product_id);',
  ],

  // Order Service
  orders: [
    'CREATE INDEX idx_orders_store_id ON "Order"(store_id);',
    'CREATE INDEX idx_orders_customer_id ON "Order"(customer_id);',
    'CREATE INDEX idx_orders_order_number ON "Order"(order_number);',
    'CREATE INDEX idx_orders_financial_status ON "Order"(financial_status);',
    'CREATE INDEX idx_orders_fulfillment_status ON "Order"(fulfillment_status);',
    'CREATE INDEX idx_orders_created_at ON "Order"(created_at);',
    'CREATE INDEX idx_order_line_items_order_id ON "OrderLineItem"(order_id);',
  ],

  // Customer Service
  customers: [
    'CREATE INDEX idx_customers_store_id ON "Customer"(store_id);',
    'CREATE INDEX idx_customers_email ON "Customer"(email);',
    'CREATE INDEX idx_customers_created_at ON "Customer"(created_at);',
  ],

  // Inventory Service
  inventory: [
    'CREATE INDEX idx_inventory_variant_id ON "InventoryItem"(variant_id);',
    'CREATE INDEX idx_inventory_location_id ON "InventoryItem"(location_id);',
    'CREATE INDEX idx_inventory_updated_at ON "InventoryItem"(updated_at);',
  ],

  // Analytics Service
  analytics: [
    'CREATE INDEX idx_analytics_store_id_timestamp ON "AnalyticsEvent"(store_id, timestamp);',
    'CREATE INDEX idx_daily_metrics_store_id_date ON "DailySalesMetrics"(store_id, date);',
  ],
};

/**
 * Query performance monitoring decorator
 */
export function MonitorQueryPerformance() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - start;

        // Log slow queries (> 50ms)
        if (duration > 50) {
          console.warn(
            `Slow query detected: ${target.constructor.name}.${propertyKey} took ${duration}ms`
          );
        }

        return result;
      } catch (error) {
        const duration = Date.now() - start;
        console.error(
          `Query failed: ${target.constructor.name}.${propertyKey} failed after ${duration}ms`,
          error
        );
        throw error;
      }
    };

    return descriptor;
  };
}
