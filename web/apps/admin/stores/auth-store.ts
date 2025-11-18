import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@ecomify/types';
import { storage } from '@ecomify/utils';

/**
 * Auth Store - Implements Observer Pattern and Singleton Pattern
 * Uses Zustand for state management with persistence
 * Observers (components) automatically re-render when state changes
 */

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (isLoading: boolean) => void;
}

/**
 * useAuthStore - Singleton Pattern
 * Creates a single global instance of the auth store
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Login action
      login: (token: string, user: User) => {
        storage.set('auth-token', token);
        storage.set('auth-user', user);
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // Logout action
      logout: () => {
        storage.remove('auth-token');
        storage.remove('refresh-token');
        storage.remove('auth-user');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Set user
      setUser: (user: User) => {
        storage.set('auth-user', user);
        set({ user });
      },

      // Set loading
      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },
    }),
    {
      name: 'auth-storage',
      // Only persist certain fields
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Custom Hook Pattern - Simplified auth hook
 * Provides a clean interface to access auth state and actions
 */
export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, setUser, setLoading } =
    useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setUser,
    setLoading,
  };
}
