/**
 * Redux Store Package
 * State management for Ecomify Mobile Apps
 */

export { store, persistor } from './store';
export type { RootState, AppDispatch } from './store';

// Slices
export { authSlice, setAuth, logout, setLoading } from './slices/authSlice';
export { cartSlice, addToCart, removeFromCart, updateQuantity, clearCart, setCart } from './slices/cartSlice';
export { uiSlice, setTheme, showToast, hideToast, setLoading as setUILoading } from './slices/uiSlice';

// Hooks
export { useAppDispatch, useAppSelector, useAuth, useCart, useTheme } from './hooks';
