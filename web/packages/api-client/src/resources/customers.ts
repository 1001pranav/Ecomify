import { apiClient } from '../client';
import type {
  Customer,
  Order,
  ApiResponse,
  PaginatedResponse,
} from '@ecomify/types';

/**
 * Customers API Resource - Facade Pattern
 */
export const customersApi = {
  async list(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Customer>>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Customer>>
    >('/customers', {
      params,
    });
    return response.data;
  },

  async get(id: string): Promise<ApiResponse<Customer>> {
    const response = await apiClient.get<ApiResponse<Customer>>(
      `/customers/${id}`
    );
    return response.data;
  },

  async update(
    id: string,
    data: Partial<Customer>
  ): Promise<ApiResponse<Customer>> {
    const response = await apiClient.patch<ApiResponse<Customer>>(
      `/customers/${id}`,
      data
    );
    return response.data;
  },

  async getOrders(id: string): Promise<ApiResponse<Order[]>> {
    const response = await apiClient.get<ApiResponse<Order[]>>(
      `/customers/${id}/orders`
    );
    return response.data;
  },
};
