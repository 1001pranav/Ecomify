import { apiClient } from '../client';
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthTokens,
  ApiResponse,
} from '@ecomify/types';

/**
 * Auth API Resource - Facade Pattern
 * Provides a simple interface for authentication operations
 */
export const authApi = {
  /**
   * Login user
   */
  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await apiClient.post<
      ApiResponse<{ user: User; tokens: AuthTokens }>
    >('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register new user
   */
  async register(
    data: RegisterData
  ): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await apiClient.post<
      ApiResponse<{ user: User; tokens: AuthTokens }>
    >('/auth/register', data);
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>('/auth/logout');
    return response.data;
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/auth/password-reset/request',
      { email }
    );
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    password: string
  ): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/auth/password-reset/confirm',
      { token, password }
    );
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/auth/password/change',
      { oldPassword, newPassword }
    );
    return response.data;
  },
};
