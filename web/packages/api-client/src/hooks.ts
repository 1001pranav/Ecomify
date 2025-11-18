import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import type {
  Product,
  ProductFilters,
  Order,
  OrderFilters,
  Customer,
  User,
  LoginCredentials,
  RegisterData,
  DashboardMetrics,
  ApiError,
} from '@ecomify/types';
import { authApi } from './resources/auth';
import { productsApi } from './resources/products';
import { ordersApi } from './resources/orders';
import { customersApi } from './resources/customers';
import { analyticsApi } from './resources/analytics';

// ==================== Auth Hooks ====================

export function useLogin(
  options?: UseMutationOptions<
    { user: User; tokens: { accessToken: string; refreshToken: string } },
    ApiError,
    LoginCredentials
  >
) {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authApi.login(credentials);
      return response.data;
    },
    ...options,
  });
}

export function useRegister(
  options?: UseMutationOptions<
    { user: User; tokens: { accessToken: string; refreshToken: string } },
    ApiError,
    RegisterData
  >
) {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await authApi.register(data);
      return response.data;
    },
    ...options,
  });
}

export function useCurrentUser(
  options?: UseQueryOptions<User, ApiError>
) {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      return response.data;
    },
    ...options,
  });
}

// ==================== Products Hooks ====================

export function useProducts(
  filters?: ProductFilters,
  options?: UseQueryOptions<any, ApiError>
) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await productsApi.list(filters);
      return response.data;
    },
    ...options,
  });
}

export function useInfiniteProducts(
  filters?: ProductFilters,
  options?: any
) {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await productsApi.list({ ...filters, page: pageParam });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    ...options,
  });
}

export function useProduct(
  idOrHandle: string,
  options?: UseQueryOptions<Product, ApiError>
) {
  return useQuery({
    queryKey: ['products', idOrHandle],
    queryFn: async () => {
      const response = await productsApi.get(idOrHandle);
      return response.data;
    },
    enabled: !!idOrHandle,
    ...options,
  });
}

export function useCreateProduct(
  options?: UseMutationOptions<Product, ApiError, Partial<Product>>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const response = await productsApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    ...options,
  });
}

export function useUpdateProduct(
  options?: UseMutationOptions<
    Product,
    ApiError,
    { id: string; data: Partial<Product> }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const response = await productsApi.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
    },
    ...options,
  });
}

export function useDeleteProduct(
  options?: UseMutationOptions<void, ApiError, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await productsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    ...options,
  });
}

// ==================== Orders Hooks ====================

export function useOrders(
  filters?: OrderFilters,
  options?: UseQueryOptions<any, ApiError>
) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const response = await ordersApi.list(filters);
      return response.data;
    },
    ...options,
  });
}

export function useOrder(
  id: string,
  options?: UseQueryOptions<Order, ApiError>
) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const response = await ordersApi.get(id);
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
}

export function useCreateOrder(
  options?: UseMutationOptions<Order, ApiError, Partial<Order>>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Order>) => {
      const response = await ordersApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    ...options,
  });
}

export function useFulfillOrder(
  options?: UseMutationOptions<
    Order,
    ApiError,
    { id: string; data: any }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await ordersApi.fulfill(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
    },
    ...options,
  });
}

// ==================== Customers Hooks ====================

export function useCustomers(
  params?: any,
  options?: UseQueryOptions<any, ApiError>
) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: async () => {
      const response = await customersApi.list(params);
      return response.data;
    },
    ...options,
  });
}

export function useCustomer(
  id: string,
  options?: UseQueryOptions<Customer, ApiError>
) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      const response = await customersApi.get(id);
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
}

// ==================== Analytics Hooks ====================

export function useDashboardMetrics(
  storeId?: string,
  options?: UseQueryOptions<DashboardMetrics, ApiError>
) {
  return useQuery({
    queryKey: ['analytics', 'dashboard', storeId],
    queryFn: async () => {
      const response = await analyticsApi.getDashboard(storeId);
      return response.data;
    },
    ...options,
  });
}

export function useSalesAnalytics(
  params: { startDate: Date; endDate: Date },
  options?: UseQueryOptions<DashboardMetrics, ApiError>
) {
  return useQuery({
    queryKey: ['analytics', 'sales', params],
    queryFn: async () => {
      const response = await analyticsApi.getSalesData({
        startDate: params.startDate.toISOString(),
        endDate: params.endDate.toISOString(),
      });
      return response.data;
    },
    ...options,
  });
}

export function useTopProducts(
  params: { limit: number },
  options?: UseQueryOptions<Product[], ApiError>
) {
  return useQuery({
    queryKey: ['analytics', 'top-products', params],
    queryFn: async () => {
      const response = await analyticsApi.getTopProducts(params);
      return response.data;
    },
    ...options,
  });
}
