import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@ecomify/types';
import { storage } from '@ecomify/utils';

/**
 * Auth Store - Implements Observer Pattern and Singleton Pattern
 * Uses Zustand for state management with persistence
 */

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

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

      setUser: (user: User) => {
        storage.set('auth-user', user);
        set({ user });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

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
