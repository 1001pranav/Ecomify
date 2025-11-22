/**
 * Cart Slice
 * Shopping cart state management
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Cart } from '@ecomify/types';
import { CART_CONFIG } from '@ecomify/core';

interface CartState {
  items: CartItem[];
  subtotal: number;
  total: number;
  discountCode: string | null;
  discountAmount: number;
  itemCount: number;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  total: 0,
  discountCode: null,
  discountAmount: 0,
  itemCount: 0,
};

// Helper to calculate totals
const calculateTotals = (items: CartItem[], discountAmount: number = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal - discountAmount);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, total, itemCount };
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.variantId === action.payload.variantId
      );

      if (existingItem) {
        // Update quantity
        existingItem.quantity = Math.min(
          existingItem.quantity + action.payload.quantity,
          CART_CONFIG.MAX_QUANTITY
        );
      } else {
        // Add new item
        state.items.push(action.payload);
      }

      // Recalculate totals
      const totals = calculateTotals(state.items, state.discountAmount);
      state.subtotal = totals.subtotal;
      state.total = totals.total;
      state.itemCount = totals.itemCount;
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);

      // Recalculate totals
      const totals = calculateTotals(state.items, state.discountAmount);
      state.subtotal = totals.subtotal;
      state.total = totals.total;
      state.itemCount = totals.itemCount;
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantity = Math.max(
          CART_CONFIG.MIN_QUANTITY,
          Math.min(action.payload.quantity, CART_CONFIG.MAX_QUANTITY)
        );
      }

      // Recalculate totals
      const totals = calculateTotals(state.items, state.discountAmount);
      state.subtotal = totals.subtotal;
      state.total = totals.total;
      state.itemCount = totals.itemCount;
    },

    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.total = 0;
      state.discountCode = null;
      state.discountAmount = 0;
      state.itemCount = 0;
    },

    setCart: (state, action: PayloadAction<Cart>) => {
      state.items = action.payload.items;
      state.subtotal = action.payload.subtotal;
      state.total = action.payload.total;
      state.discountCode = action.payload.discountCode || null;
      state.discountAmount = action.payload.discountAmount;
      state.itemCount = action.payload.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
    },

    applyDiscount: (
      state,
      action: PayloadAction<{ code: string; amount: number }>
    ) => {
      state.discountCode = action.payload.code;
      state.discountAmount = action.payload.amount;

      // Recalculate totals
      const totals = calculateTotals(state.items, action.payload.amount);
      state.subtotal = totals.subtotal;
      state.total = totals.total;
    },

    removeDiscount: (state) => {
      state.discountCode = null;
      state.discountAmount = 0;

      // Recalculate totals
      const totals = calculateTotals(state.items, 0);
      state.total = totals.total;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCart,
  applyDiscount,
  removeDiscount,
} = cartSlice.actions;

export default cartSlice.reducer;
