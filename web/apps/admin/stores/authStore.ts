import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '@ecomify/types';

/**
 * Auth Store - Singleton Pattern with Observer Pattern
 *
 * Manages authentication state across the application
 * Persists to localStorage for session management
 */
interface AuthStore extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token: string, user: User) => {
        // Store token in localStorage for API client
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
        }
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        // Clear token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
        }
        set({ token: null, user: null, isAuthenticated: false });
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

/**
 * Custom hook for auth - Custom Hooks Pattern
 */
export function useAuth() {
  const { user, isAuthenticated, login, logout, updateUser } = useAuthStore();
  return { user, isAuthenticated, login, logout, updateUser };
}
