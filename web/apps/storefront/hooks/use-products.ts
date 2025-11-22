'use client';

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@ecomify/api-client';
import type { Product, ProductFilters } from '@ecomify/types';

/**
 * Product Hooks - Custom Hooks Pattern
 * Type-safe data fetching hooks for products
 */

// Query keys factory
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (idOrHandle: string) => [...productKeys.details(), idOrHandle] as const,
  search: (query: string) => [...productKeys.all, 'search', query] as const,
  related: (productId: string) => [...productKeys.all, 'related', productId] as const,
};

/**
 * Fetch paginated list of products
 */
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: async () => {
      const response = await productsApi.list(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch products with infinite scroll
 */
export function useInfiniteProducts(filters: Omit<ProductFilters, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: productKeys.list({ ...filters, infinite: true } as ProductFilters),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await productsApi.list({
        ...filters,
        page: pageParam,
        limit: filters.limit || 12,
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch single product by ID or handle
 */
export function useProduct(idOrHandle: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: productKeys.detail(idOrHandle),
    queryFn: async () => {
      const response = await productsApi.get(idOrHandle);
      return response.data;
    },
    enabled: options.enabled !== false && !!idOrHandle,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Search products - for autocomplete
 */
export function useProductSearch(
  query: string,
  options: { enabled?: boolean; limit?: number } = {}
) {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn: async () => {
      const response = await productsApi.search({
        q: query,
        limit: options.limit || 5,
      });
      return response.data;
    },
    enabled: options.enabled !== false && query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch related products
 */
export function useRelatedProducts(productId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: productKeys.related(productId),
    queryFn: async () => {
      const response = await productsApi.getRelated(productId);
      return response.data;
    },
    enabled: options.enabled !== false && !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Prefetch product - for hover preloading
 */
export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return (idOrHandle: string) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(idOrHandle),
      queryFn: async () => {
        const response = await productsApi.get(idOrHandle);
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
