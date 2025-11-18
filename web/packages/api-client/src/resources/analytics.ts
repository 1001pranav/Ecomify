import { apiClient } from '../client';
import type { DashboardMetrics, ApiResponse, Product } from '@ecomify/types';

/**
 * Analytics API Resource - Facade Pattern
 */
export const analyticsApi = {
  async getDashboard(storeId?: string): Promise<ApiResponse<DashboardMetrics>> {
    const response = await apiClient.get<ApiResponse<DashboardMetrics>>(
      '/analytics/dashboard',
      {
        params: { storeId },
      }
    );
    return response.data;
  },

  async getSalesData(params: {
    startDate: string;
    endDate: string;
    storeId?: string;
  }): Promise<ApiResponse<DashboardMetrics>> {
    const response = await apiClient.get<ApiResponse<DashboardMetrics>>(
      '/analytics/sales',
      {
        params,
      }
    );
    return response.data;
  },

  async getTopProducts(params: {
    limit: number;
    storeId?: string;
  }): Promise<ApiResponse<Product[]>> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      '/analytics/top-products',
      {
        params,
      }
    );
    return response.data;
  },
};
