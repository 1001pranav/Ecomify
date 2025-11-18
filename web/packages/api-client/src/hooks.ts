import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  Product,
  ProductFilters,
  ProductFormValues,
  Order,
  OrderFilters,
  Customer,
  CustomerFilters,
  DashboardMetrics,
  Category,
} from '@ecomify/types';

/**
 * Custom React Query Hooks for API calls
 * Following the Custom Hooks Pattern
 */

// ========== Products Hooks ==========

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await apiClient.products.list(filters);
      return response.data;
    },
  });
}

export function useProduct(id?: string, options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required');
      const response = await apiClient.products.get(id);
      return response.data.data;
    },
    enabled: !!id && (options?.enabled !== false),
    ...options,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductFormValues) => apiClient.products.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormValues> }) =>
      apiClient.products.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ========== Categories Hooks ==========

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.categories.list();
      return response.data;
    },
  });
}

// ========== Orders Hooks ==========

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const response = await apiClient.orders.list(filters);
      return response.data;
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await apiClient.orders.get(id);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useFulfillOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.orders.fulfill(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
    },
  });
}

// ========== Customers Hooks ==========

export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: async () => {
      const response = await apiClient.customers.list(filters);
      return response.data;
    },
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await apiClient.customers.get(id);
      return response.data.data;
    },
    enabled: !!id,
  });
}

// ========== Analytics Hooks ==========

export function useDashboardMetrics(storeId: string) {
  return useQuery({
    queryKey: ['dashboard', storeId],
    queryFn: async () => {
      const response = await apiClient.analytics.getDashboard(storeId);
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: !!storeId,
  });
}

export function useTopProducts(params: { limit?: number } = {}) {
  return useQuery({
    queryKey: ['top-products', params],
    queryFn: async () => {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 30);
      const response = await apiClient.analytics.getTopProducts({
        dateFrom: dateFrom.toISOString(),
        dateTo: new Date().toISOString(),
        ...params,
      });
      return response.data;
    },
  });
}

// ========== Upload Hook ==========

export function useUploadImage() {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      apiClient.upload.image(file, folder),
  });
}
