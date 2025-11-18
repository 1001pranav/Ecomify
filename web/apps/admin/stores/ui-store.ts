import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * UI Store - Implements Observer Pattern and Singleton Pattern
 * Manages UI state like sidebar, modals, etc.
 */

interface UIState {
  // Sidebar state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Modal state
  activeModal: string | null;
  modalData: any | null;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (modalId: string, data?: any) => void;
  closeModal: () => void;
}

/**
 * useUIStore - Singleton Pattern
 * Creates a single global instance of the UI store
 */
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      sidebarOpen: true,
      sidebarCollapsed: false,
      activeModal: null,
      modalData: null,

      // Sidebar actions
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open: boolean) =>
        set({ sidebarOpen: open }),

      toggleSidebarCollapsed: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed: boolean) =>
        set({ sidebarCollapsed: collapsed }),

      // Modal actions
      openModal: (modalId: string, data?: any) =>
        set({ activeModal: modalId, modalData: data }),

      closeModal: () =>
        set({ activeModal: null, modalData: null }),
    }),
    {
      name: 'ui-storage',
      // Only persist sidebar state
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

/**
 * Custom Hook Pattern - Simplified UI hook
 */
export function useUI() {
  const {
    sidebarOpen,
    sidebarCollapsed,
    activeModal,
    modalData,
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarCollapsed,
    setSidebarCollapsed,
    openModal,
    closeModal,
  } = useUIStore();

  return {
    sidebarOpen,
    sidebarCollapsed,
    activeModal,
    modalData,
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarCollapsed,
    setSidebarCollapsed,
    openModal,
    closeModal,
  };
}
