/**
 * Redux Hooks
 * Typed hooks for accessing store state and dispatch
 */

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { useCallback } from 'react';
import type { RootState, AppDispatch } from './store';
import {
  loginAsync,
  registerAsync,
  logoutAsync,
  fetchProfileAsync,
  clearError,
} from './slices/authSlice';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from './slices/cartSlice';
import { setTheme, showToast, hideToast } from './slices/uiSlice';
import type { CartItem } from '@ecomify/types';

// Base typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Auth Hook
 * Complete authentication management
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  const login = useCallback(
    async (email: string, password: string) => {
      return dispatch(loginAsync({ email, password })).unwrap();
    },
    [dispatch]
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      return dispatch(registerAsync(data)).unwrap();
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    return dispatch(logoutAsync()).unwrap();
  }, [dispatch]);

  const fetchProfile = useCallback(async () => {
    return dispatch(fetchProfileAsync()).unwrap();
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchProfile,
    clearAuthError,
  };
}

/**
 * Cart Hook
 * Shopping cart management
 */
export function useCart() {
  const dispatch = useAppDispatch();
  const { items, subtotal, total, discountCode, discountAmount, itemCount } =
    useAppSelector((state) => state.cart);

  const addItem = useCallback(
    (item: CartItem) => {
      dispatch(addToCart(item));
    },
    [dispatch]
  );

  const removeItem = useCallback(
    (id: string) => {
      dispatch(removeFromCart(id));
    },
    [dispatch]
  );

  const updateItemQuantity = useCallback(
    (id: string, quantity: number) => {
      dispatch(updateQuantity({ id, quantity }));
    },
    [dispatch]
  );

  const clear = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  return {
    items,
    subtotal,
    total,
    discountCode,
    discountAmount,
    itemCount,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart: clear,
  };
}

/**
 * Theme Hook
 * Theme management
 */
export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  const changeTheme = useCallback(
    (newTheme: 'light' | 'dark' | 'system') => {
      dispatch(setTheme(newTheme));
    },
    [dispatch]
  );

  return { theme, setTheme: changeTheme };
}

/**
 * Toast Hook
 * Toast notifications
 */
export function useToast() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.ui.toasts);

  const show = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'info' | 'warning' = 'info',
      duration?: number
    ) => {
      dispatch(showToast({ message, type, duration }));
    },
    [dispatch]
  );

  const hide = useCallback(
    (id: string) => {
      dispatch(hideToast(id));
    },
    [dispatch]
  );

  return { toasts, showToast: show, hideToast: hide };
}

/**
 * Loading Hook
 * Global loading state
 */
export function useLoading() {
  const { isLoading, loadingMessage } = useAppSelector((state) => state.ui);
  return { isLoading, loadingMessage };
}
