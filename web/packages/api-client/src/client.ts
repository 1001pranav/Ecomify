import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  Product,
  ProductFilters,
  ProductFormValues,
  Order,
  OrderFilters,
  FulfillmentInput,
  Customer,
  CustomerFilters,
  DashboardMetrics,
  TopProduct,
  AnalyticsFilters,
  Category,
  PaginatedResponse,
  ApiResponse,
} from '@ecomify/types';

/**
 * ApiClient - Singleton Pattern & Facade Pattern
 *
 * Provides a single instance of the API client with interceptors
 * and facades for different resource types
 */
class ApiClient {
  private static instance: ApiClient;
  private axios: AxiosInstance;

  private constructor() {
    this.axios = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Singleton getInstance method
   */
  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.axios.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors and token refresh
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 - Unauthorized (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axios.request(originalRequest);
            }
          } catch (refreshError) {
            // Redirect to login or clear auth
            this.clearAuth();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Get auth token from storage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return null;

      const response = await this.axios.post('/auth/refresh', { refreshToken });
      const newToken = response.data.accessToken;

      localStorage.setItem('auth_token', newToken);
      return newToken;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear authentication
   */
  private clearAuth() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Products API Facade
   */
  products = {
    list: (params?: ProductFilters) =>
      this.axios.get<PaginatedResponse<Product>>('/products', { params }),

    get: (id: string) => this.axios.get<ApiResponse<Product>>(`/products/${id}`),

    create: (data: ProductFormValues) =>
      this.axios.post<ApiResponse<Product>>('/products', data),

    update: (id: string, data: Partial<ProductFormValues>) =>
      this.axios.patch<ApiResponse<Product>>(`/products/${id}`, data),

    delete: (id: string) => this.axios.delete(`/products/${id}`),

    search: (params: { q: string; limit?: number }) =>
      this.axios.get<Product[]>('/products/search', { params }),
  };

  /**
   * Categories API Facade
   */
  categories = {
    list: () => this.axios.get<Category[]>('/categories'),

    get: (id: string) => this.axios.get<ApiResponse<Category>>(`/categories/${id}`),

    create: (data: Partial<Category>) =>
      this.axios.post<ApiResponse<Category>>('/categories', data),

    update: (id: string, data: Partial<Category>) =>
      this.axios.patch<ApiResponse<Category>>(`/categories/${id}`, data),

    delete: (id: string) => this.axios.delete(`/categories/${id}`),
  };

  /**
   * Orders API Facade
   */
  orders = {
    list: (params?: OrderFilters) =>
      this.axios.get<PaginatedResponse<Order>>('/orders', { params }),

    get: (id: string) => this.axios.get<ApiResponse<Order>>(`/orders/${id}`),

    create: (data: any) => this.axios.post<ApiResponse<Order>>('/orders', data),

    update: (id: string, data: Partial<Order>) =>
      this.axios.patch<ApiResponse<Order>>(`/orders/${id}`, data),

    fulfill: (id: string, data: FulfillmentInput) =>
      this.axios.post<ApiResponse<Order>>(`/orders/${id}/fulfill`, data),

    cancel: (id: string) =>
      this.axios.post<ApiResponse<Order>>(`/orders/${id}/cancel`),

    refund: (id: string, amount: number) =>
      this.axios.post<ApiResponse<Order>>(`/orders/${id}/refund`, { amount }),
  };

  /**
   * Customers API Facade
   */
  customers = {
    list: (params?: CustomerFilters) =>
      this.axios.get<PaginatedResponse<Customer>>('/customers', { params }),

    get: (id: string) => this.axios.get<ApiResponse<Customer>>(`/customers/${id}`),

    update: (id: string, data: Partial<Customer>) =>
      this.axios.patch<ApiResponse<Customer>>(`/customers/${id}`, data),

    delete: (id: string) => this.axios.delete(`/customers/${id}`),
  };

  /**
   * Analytics API Facade
   */
  analytics = {
    getDashboard: (storeId: string) =>
      this.axios.get<DashboardMetrics>(`/analytics/dashboard`, {
        params: { storeId },
      }),

    getTopProducts: (params: AnalyticsFilters & { limit?: number }) =>
      this.axios.get<TopProduct[]>('/analytics/top-products', { params }),

    getSalesData: (params: AnalyticsFilters) =>
      this.axios.get('/analytics/sales', { params }),
  };

  /**
   * Auth API Facade
   */
  auth = {
    login: (email: string, password: string) =>
      this.axios.post('/auth/login', { email, password }),

    register: (data: any) => this.axios.post('/auth/register', data),

    logout: () => this.axios.post('/auth/logout'),

    me: () => this.axios.get('/auth/me'),
  };

  /**
   * Upload API
   */
  upload = {
    image: (file: File, folder?: string) => {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) formData.append('folder', folder);

      return this.axios.post<{ url: string }>('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  };
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();
