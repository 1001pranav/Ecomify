import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@ecomify/types';

/**
 * Cart Store - Implements Observer Pattern and Singleton Pattern
 * Uses Zustand for state management with persistence
 * Implements Strategy Pattern for discount calculation
 */

interface CartState {
  // State
  items: CartItem[];
  discountCode: string | null;
  discountAmount: number;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  applyDiscount: (code: string, amount: number) => void;
  removeDiscount: () => void;

  // Computed values
  getTotal: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
}

/**
 * useCartStore - Singleton Pattern
 * Creates a single global instance of the cart store
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      discountCode: null,
      discountAmount: 0,

      // Add item to cart
      addItem: (item: Omit<CartItem, 'quantity'>) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.variantId === item.variantId
          );

          if (existing) {
            // Increase quantity if item already exists
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }

          // Add new item
          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        });
      },

      // Remove item from cart
      removeItem: (variantId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }));
      },

      // Update item quantity
      updateQuantity: (variantId: string, quantity: number) => {
        if (quantity === 0) {
          get().removeItem(variantId);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        }));
      },

      // Clear cart
      clearCart: () => {
        set({ items: [], discountCode: null, discountAmount: 0 });
      },

      // Apply discount - Strategy Pattern
      applyDiscount: (code: string, amount: number) => {
        set({ discountCode: code, discountAmount: amount });
      },

      // Remove discount
      removeDiscount: () => {
        set({ discountCode: null, discountAmount: 0 });
      },

      // Get subtotal
      getSubtotal: () => {
        const state = get();
        return state.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      // Get total (subtotal - discount)
      getTotal: () => {
        const state = get();
        const subtotal = state.getSubtotal();
        return Math.max(0, subtotal - state.discountAmount);
      },

      // Get item count
      getItemCount: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

/**
 * Custom Hook Pattern - Simplified cart hook
 */
export function useCart() {
  const {
    items,
    discountCode,
    discountAmount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyDiscount,
    removeDiscount,
    getTotal,
    getSubtotal,
    getItemCount,
  } = useCartStore();

  return {
    items,
    discountCode,
    discountAmount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyDiscount,
    removeDiscount,
    getTotal,
    getSubtotal,
    getItemCount,
  };
}
