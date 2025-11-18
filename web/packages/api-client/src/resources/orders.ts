import { apiClient } from '../client';
import type {
  Order,
  OrderFilters,
  FulfillmentInput,
  ApiResponse,
  PaginatedResponse,
} from '@ecomify/types';

/**
 * Orders API Resource - Facade Pattern
 */
export const ordersApi = {
  async list(
    filters?: OrderFilters
  ): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Order>>
    >('/orders', {
      params: filters,
    });
    return response.data;
  },

  async get(id: string): Promise<ApiResponse<Order>> {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },

  async create(data: Partial<Order>): Promise<ApiResponse<Order>> {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', data);
    return response.data;
  },

  async update(id: string, data: Partial<Order>): Promise<ApiResponse<Order>> {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/orders/${id}`,
      data
    );
    return response.data;
  },

  async cancel(id: string, reason?: string): Promise<ApiResponse<Order>> {
    const response = await apiClient.post<ApiResponse<Order>>(
      `/orders/${id}/cancel`,
      { reason }
    );
    return response.data;
  },

  async fulfill(
    id: string,
    data: FulfillmentInput
  ): Promise<ApiResponse<Order>> {
    const response = await apiClient.post<ApiResponse<Order>>(
      `/orders/${id}/fulfill`,
      data
    );
    return response.data;
  },

  async refund(
    id: string,
    amount: number,
    reason?: string
  ): Promise<ApiResponse<Order>> {
    const response = await apiClient.post<ApiResponse<Order>>(
      `/orders/${id}/refund`,
      { amount, reason }
    );
    return response.data;
  },

  async export(filters?: OrderFilters): Promise<Blob> {
    const response = await apiClient.get('/orders/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};
