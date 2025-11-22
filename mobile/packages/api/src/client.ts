/**
 * API Client
 * Singleton Pattern with Interceptors and Offline Queue
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { STORAGE_KEYS, API_CONFIG } from '@ecomify/core';
import type {
  User,
  Product,
  Order,
  Cart,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  DashboardMetrics,
  PaginatedResponse,
  ProductFilters,
  OrderFilters,
  Address,
} from '@ecomify/types';

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
}

type OfflineRequest = {
  config: AxiosRequestConfig;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

/**
 * Singleton API Client Class
 */
class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private offlineQueue: OfflineRequest[] = [];
  private isOnline: boolean = true;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  private constructor(config?: ApiClientConfig) {
    this.axiosInstance = axios.create({
      baseURL: config?.baseURL || API_CONFIG.BASE_URL,
      timeout: config?.timeout || API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.setupNetworkListener();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: ApiClientConfig): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(config);
    }
    return ApiClient.instance;
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - try token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Wait for token refresh
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.axiosInstance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.isRefreshing = false;

            // Notify subscribers
            this.refreshSubscribers.forEach((callback) => callback(newToken));
            this.refreshSubscribers = [];

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
            // Clear auth data and redirect to login
            await this.clearAuthData();
            return Promise.reject(refreshError);
          }
        }

        // Handle offline - queue request
        if (!error.response && !this.isOnline) {
          return this.queueOfflineRequest(originalRequest);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Setup network listener for offline support
   */
  private setupNetworkListener(): void {
    NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      // Process offline queue when back online
      if (wasOffline && this.isOnline) {
        this.processOfflineQueue();
      }
    });
  }

  /**
   * Queue request for offline processing
   */
  private queueOfflineRequest(config: AxiosRequestConfig): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.offlineQueue.push({ config, resolve, reject });
    });
  }

  /**
   * Process offline queue
   */
  private async processOfflineQueue(): Promise<void> {
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const request of queue) {
      try {
        const response = await this.axiosInstance(request.config);
        request.resolve(response);
      } catch (error) {
        request.reject(error);
      }
    }
  }

  /**
   * Refresh access token
   */
  private async refreshToken(): Promise<string> {
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post<AuthResponse>(
      `${API_CONFIG.BASE_URL}/auth/refresh`,
      { refreshToken }
    );

    const { token } = response.data;
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    return token;
  }

  /**
   * Clear authentication data
   */
  private async clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
  }

  // ==================== AUTH API ====================

  auth = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await this.axiosInstance.post<AuthResponse>(
        '/auth/login',
        credentials
      );
      const { token, refreshToken, user } = response.data;
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return response.data;
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
      const response = await this.axiosInstance.post<AuthResponse>(
        '/auth/register',
        data
      );
      return response.data;
    },

    logout: async (): Promise<void> => {
      try {
        await this.axiosInstance.post('/auth/logout');
      } finally {
        await this.clearAuthData();
      }
    },

    forgotPassword: async (email: string): Promise<void> => {
      await this.axiosInstance.post('/auth/forgot-password', { email });
    },

    resetPassword: async (token: string, password: string): Promise<void> => {
      await this.axiosInstance.post('/auth/reset-password', { token, password });
    },

    getProfile: async (): Promise<User> => {
      const response = await this.axiosInstance.get<User>('/auth/profile');
      return response.data;
    },

    updateProfile: async (data: Partial<User>): Promise<User> => {
      const response = await this.axiosInstance.patch<User>('/auth/profile', data);
      return response.data;
    },
  };

  // ==================== PRODUCTS API ====================

  products = {
    list: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      filters?: ProductFilters;
    }): Promise<PaginatedResponse<Product>> => {
      const response = await this.axiosInstance.get<PaginatedResponse<Product>>(
        '/products',
        { params }
      );
      return response.data;
    },

    get: async (id: string): Promise<Product> => {
      const response = await this.axiosInstance.get<Product>(`/products/${id}`);
      return response.data;
    },

    getByHandle: async (handle: string): Promise<Product> => {
      const response = await this.axiosInstance.get<Product>(
        `/products/handle/${handle}`
      );
      return response.data;
    },

    search: async (query: string): Promise<Product[]> => {
      const response = await this.axiosInstance.get<Product[]>(
        '/products/search',
        { params: { q: query } }
      );
      return response.data;
    },

    create: async (data: Partial<Product>): Promise<Product> => {
      const response = await this.axiosInstance.post<Product>('/products', data);
      return response.data;
    },

    update: async (id: string, data: Partial<Product>): Promise<Product> => {
      const response = await this.axiosInstance.patch<Product>(
        `/products/${id}`,
        data
      );
      return response.data;
    },

    delete: async (id: string): Promise<void> => {
      await this.axiosInstance.delete(`/products/${id}`);
    },

    related: async (id: string, limit?: number): Promise<Product[]> => {
      const response = await this.axiosInstance.get<Product[]>(
        `/products/${id}/related`,
        { params: { limit } }
      );
      return response.data;
    },
  };

  // ==================== ORDERS API ====================

  orders = {
    list: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      filters?: OrderFilters;
    }): Promise<PaginatedResponse<Order>> => {
      const response = await this.axiosInstance.get<PaginatedResponse<Order>>(
        '/orders',
        { params }
      );
      return response.data;
    },

    get: async (id: string): Promise<Order> => {
      const response = await this.axiosInstance.get<Order>(`/orders/${id}`);
      return response.data;
    },

    create: async (data: {
      items: Array<{ variantId: string; quantity: number }>;
      shippingAddressId: string;
      shippingMethodId: string;
      paymentMethodId: string;
      note?: string;
    }): Promise<Order> => {
      const response = await this.axiosInstance.post<Order>('/orders', data);
      return response.data;
    },

    cancel: async (id: string): Promise<Order> => {
      const response = await this.axiosInstance.post<Order>(
        `/orders/${id}/cancel`
      );
      return response.data;
    },

    fulfill: async (
      id: string,
      data: { trackingNumber?: string; carrier?: string }
    ): Promise<Order> => {
      const response = await this.axiosInstance.post<Order>(
        `/orders/${id}/fulfill`,
        data
      );
      return response.data;
    },

    refund: async (
      id: string,
      data: { amount: number; reason?: string }
    ): Promise<Order> => {
      const response = await this.axiosInstance.post<Order>(
        `/orders/${id}/refund`,
        data
      );
      return response.data;
    },
  };

  // ==================== CART API ====================

  cart = {
    get: async (): Promise<Cart> => {
      const response = await this.axiosInstance.get<Cart>('/cart');
      return response.data;
    },

    addItem: async (variantId: string, quantity: number): Promise<Cart> => {
      const response = await this.axiosInstance.post<Cart>('/cart/items', {
        variantId,
        quantity,
      });
      return response.data;
    },

    updateItem: async (itemId: string, quantity: number): Promise<Cart> => {
      const response = await this.axiosInstance.patch<Cart>(
        `/cart/items/${itemId}`,
        { quantity }
      );
      return response.data;
    },

    removeItem: async (itemId: string): Promise<Cart> => {
      const response = await this.axiosInstance.delete<Cart>(
        `/cart/items/${itemId}`
      );
      return response.data;
    },

    clear: async (): Promise<void> => {
      await this.axiosInstance.delete('/cart');
    },

    applyDiscount: async (code: string): Promise<Cart> => {
      const response = await this.axiosInstance.post<Cart>('/cart/discount', {
        code,
      });
      return response.data;
    },

    removeDiscount: async (): Promise<Cart> => {
      const response = await this.axiosInstance.delete<Cart>('/cart/discount');
      return response.data;
    },
  };

  // ==================== ADDRESSES API ====================

  addresses = {
    list: async (): Promise<Address[]> => {
      const response = await this.axiosInstance.get<Address[]>('/addresses');
      return response.data;
    },

    create: async (data: Omit<Address, 'id'>): Promise<Address> => {
      const response = await this.axiosInstance.post<Address>('/addresses', data);
      return response.data;
    },

    update: async (id: string, data: Partial<Address>): Promise<Address> => {
      const response = await this.axiosInstance.patch<Address>(
        `/addresses/${id}`,
        data
      );
      return response.data;
    },

    delete: async (id: string): Promise<void> => {
      await this.axiosInstance.delete(`/addresses/${id}`);
    },

    setDefault: async (id: string): Promise<Address> => {
      const response = await this.axiosInstance.post<Address>(
        `/addresses/${id}/default`
      );
      return response.data;
    },
  };

  // ==================== ANALYTICS API ====================

  analytics = {
    getDashboard: async (): Promise<DashboardMetrics> => {
      const response = await this.axiosInstance.get<DashboardMetrics>(
        '/analytics/dashboard'
      );
      return response.data;
    },

    getSalesData: async (params: {
      startDate: string;
      endDate: string;
      groupBy?: 'day' | 'week' | 'month';
    }): Promise<Array<{ date: string; revenue: number; orders: number }>> => {
      const response = await this.axiosInstance.get('/analytics/sales', {
        params,
      });
      return response.data;
    },
  };

  // ==================== MEDIA API ====================

  media = {
    upload: async (formData: FormData): Promise<{ url: string; id: string }> => {
      const response = await this.axiosInstance.post<{ url: string; id: string }>(
        '/media/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },

    delete: async (id: string): Promise<void> => {
      await this.axiosInstance.delete(`/media/${id}`);
    },
  };
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();
