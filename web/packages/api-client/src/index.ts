// Export API client singleton instance
export { apiClient, ApiClient } from './client';

// Export API resources (Facade Pattern)
export { authApi } from './resources/auth';
export { productsApi } from './resources/products';
export { ordersApi } from './resources/orders';
export { customersApi } from './resources/customers';
export { analyticsApi } from './resources/analytics';

// Export React Query hooks
export * from './hooks';
