/**
 * Product Hooks
 * Data fetching hooks for products
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@ecomify/api';
import { CACHE_CONFIG, PAGINATION } from '@ecomify/core';
import type { Product, ProductFilters } from '@ecomify/types';

/**
 * Fetch paginated products
 */
export function useProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  filters?: ProductFilters;
}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () =>
      apiClient.products.list({
        page: params?.page || 1,
        limit: params?.limit || PAGINATION.PRODUCTS_PER_PAGE,
        search: params?.search,
        filters: params?.filters,
      }),
    staleTime: CACHE_CONFIG.PRODUCTS_STALE_TIME,
  });
}

/**
 * Fetch single product by ID
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => apiClient.products.get(id),
    enabled: !!id,
    staleTime: CACHE_CONFIG.PRODUCTS_STALE_TIME,
  });
}

/**
 * Search products
 */
export function useProductSearch(query: string) {
  return useQuery({
    queryKey: ['productSearch', query],
    queryFn: () => apiClient.products.search(query),
    enabled: query.length >= 2,
    staleTime: CACHE_CONFIG.PRODUCTS_STALE_TIME,
  });
}

/**
 * Infinite scroll products
 */
export function useInfiniteProducts(params?: {
  search?: string;
  filters?: ProductFilters;
}) {
  return useInfiniteQuery({
    queryKey: ['infiniteProducts', params],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.products.list({
        page: pageParam,
        limit: PAGINATION.PRODUCTS_PER_PAGE,
        search: params?.search,
        filters: params?.filters,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: CACHE_CONFIG.PRODUCTS_STALE_TIME,
  });
}
