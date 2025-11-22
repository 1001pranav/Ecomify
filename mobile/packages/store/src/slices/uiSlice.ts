/**
 * UI Slice
 * UI state management (theme, toasts, loading)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark' | 'system';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface UIState {
  theme: Theme;
  toasts: Toast[];
  isLoading: boolean;
  loadingMessage: string | null;
}

const initialState: UIState = {
  theme: 'system',
  toasts: [],
  isLoading: false,
  loadingMessage: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },

    showToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const toast: Toast = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.toasts.push(toast);
    },

    hideToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },

    clearAllToasts: (state) => {
      state.toasts = [];
    },

    setLoading: (
      state,
      action: PayloadAction<{ isLoading: boolean; message?: string | null }>
    ) => {
      state.isLoading = action.payload.isLoading;
      state.loadingMessage = action.payload.message || null;
    },
  },
});

export const { setTheme, showToast, hideToast, clearAllToasts, setLoading } =
  uiSlice.actions;

export default uiSlice.reducer;
