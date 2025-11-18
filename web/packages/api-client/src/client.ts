import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse, ApiError } from '@ecomify/types';
import { storage } from '@ecomify/utils';

/**
 * ApiClient - Implements Singleton Pattern
 * Provides a single instance of the API client throughout the application
 * Also implements Facade Pattern - provides a simple interface over Axios
 * And Interceptor Pattern - for request/response manipulation
 */
export class ApiClient {
  private static instance: ApiClient;
  private axios: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  private constructor() {
    // Create axios instance with default config
    this.axios = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Singleton Pattern: Get the single instance of ApiClient
   */
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Interceptor Pattern: Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request Interceptor - Add auth token to requests
    this.axios.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response Interceptor - Handle errors and token refresh
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.axios.request(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear auth and redirect to login
            this.clearAuth();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  /**
   * Get auth token from storage
   */
  private getAuthToken(): string | null {
    return storage.get<string>('auth-token');
  }

  /**
   * Get refresh token from storage
   */
  private getRefreshToken(): string | null {
    return storage.get<string>('refresh-token');
  }

  /**
   * Refresh access token using refresh token
   * Implements token refresh logic with promise caching to prevent multiple simultaneous refresh requests
   */
  private async refreshToken(): Promise<string> {
    // If there's already a refresh in progress, return that promise
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Create the refresh promise
    this.refreshTokenPromise = (async () => {
      try {
        const response = await this.axios.post<
          ApiResponse<{ accessToken: string; refreshToken: string }>
        >('/auth/refresh', {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // Store new tokens
        storage.set('auth-token', accessToken);
        storage.set('refresh-token', newRefreshToken);

        return accessToken;
      } finally {
        // Clear the promise cache
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  /**
   * Clear authentication tokens
   */
  private clearAuth(): void {
    storage.remove('auth-token');
    storage.remove('refresh-token');
    storage.remove('auth-user');
  }

  /**
   * Normalize error response
   */
  private normalizeError(error: any): ApiError {
    if (error.response) {
      // Server responded with error
      return {
        message:
          error.response.data?.message || 'An error occurred',
        code: error.response.data?.code,
        statusCode: error.response.status,
        errors: error.response.data?.errors,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'Network error. Please check your connection.',
        statusCode: 0,
      };
    } else {
      // Error in request setup
      return {
        message: error.message || 'An error occurred',
        statusCode: 0,
      };
    }
  }

  /**
   * Facade Pattern: Simplified HTTP methods
   */
  public async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axios.get<T>(url, config);
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axios.post<T>(url, data, config);
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axios.put<T>(url, data, config);
  }

  public async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axios.patch<T>(url, data, config);
  }

  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axios.delete<T>(url, config);
  }

  /**
   * Upload file with progress tracking
   */
  public async upload<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.axios.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();
