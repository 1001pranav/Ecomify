import { apiClient } from '../client';
import type {
  Product,
  ProductFilters,
  ApiResponse,
  PaginatedResponse,
} from '@ecomify/types';

/**
 * Products API Resource - Facade Pattern
 * Provides a simple interface for product operations
 */
export const productsApi = {
  /**
   * Get paginated list of products
   */
  async list(
    filters?: ProductFilters
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Product>>
    >('/products', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get single product by ID or handle
   */
  async get(idOrHandle: string): Promise<ApiResponse<Product>> {
    const response = await apiClient.get<ApiResponse<Product>>(
      `/products/${idOrHandle}`
    );
    return response.data;
  },

  /**
   * Create new product
   */
  async create(data: Partial<Product>): Promise<ApiResponse<Product>> {
    const response = await apiClient.post<ApiResponse<Product>>(
      '/products',
      data
    );
    return response.data;
  },

  /**
   * Update product
   */
  async update(
    id: string,
    data: Partial<Product>
  ): Promise<ApiResponse<Product>> {
    const response = await apiClient.patch<ApiResponse<Product>>(
      `/products/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete product
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/products/${id}`
    );
    return response.data;
  },

  /**
   * Search products
   */
  async search(query: {
    q: string;
    limit?: number;
  }): Promise<ApiResponse<Product[]>> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      '/products/search',
      {
        params: query,
      }
    );
    return response.data;
  },

  /**
   * Get related products
   */
  async getRelated(productId: string): Promise<ApiResponse<Product[]>> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `/products/${productId}/related`
    );
    return response.data;
  },

  /**
   * Bulk delete products
   */
  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/products/bulk/delete',
      { ids }
    );
    return response.data;
  },

  /**
   * Bulk update products
   */
  async bulkUpdate(
    ids: string[],
    data: Partial<Product>
  ): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/products/bulk/update',
      { ids, data }
    );
    return response.data;
  },
};
