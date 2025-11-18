import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * UI Store - Observer Pattern
 *
 * Manages UI state like sidebar, theme, etc.
 */
interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

      setTheme: (theme: 'light' | 'dark') => set({ theme }),
    }),
    {
      name: 'ui-storage',
    }
  )
);
