/**
 * Order Hooks
 * Data fetching hooks for orders
 */

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@ecomify/api';
import { CACHE_CONFIG, PAGINATION } from '@ecomify/core';
import type { Order, OrderFilters } from '@ecomify/types';

/**
 * Fetch paginated orders
 */
export function useOrders(params?: {
  page?: number;
  limit?: number;
  search?: string;
  filters?: OrderFilters;
}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () =>
      apiClient.orders.list({
        page: params?.page || 1,
        limit: params?.limit || PAGINATION.ORDERS_PER_PAGE,
        search: params?.search,
        filters: params?.filters,
      }),
    staleTime: CACHE_CONFIG.ORDERS_STALE_TIME,
  });
}

/**
 * Fetch single order by ID
 */
export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => apiClient.orders.get(id),
    enabled: !!id,
    staleTime: CACHE_CONFIG.ORDERS_STALE_TIME,
  });
}

/**
 * Infinite scroll orders
 */
export function useInfiniteOrders(params?: {
  search?: string;
  filters?: OrderFilters;
}) {
  return useInfiniteQuery({
    queryKey: ['infiniteOrders', params],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.orders.list({
        page: pageParam,
        limit: PAGINATION.ORDERS_PER_PAGE,
        search: params?.search,
        filters: params?.filters,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: CACHE_CONFIG.ORDERS_STALE_TIME,
  });
}

/**
 * Fulfill order mutation
 */
export function useFulfillOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      trackingNumber,
      carrier,
    }: {
      id: string;
      trackingNumber?: string;
      carrier?: string;
    }) => apiClient.orders.fulfill(id, { trackingNumber, carrier }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });
}

/**
 * Cancel order mutation
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.orders.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });
}

/**
 * Refund order mutation
 */
export function useRefundOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      amount,
      reason,
    }: {
      id: string;
      amount: number;
      reason?: string;
    }) => apiClient.orders.refund(id, { amount, reason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });
}
