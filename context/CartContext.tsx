'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import type { Product, ToastMessage, ToastType } from '@/types';
import { cartReducer, initialCartState } from './cartReducer';

interface CartContextType {
  items: import('@/types').CartItem[];
  isCartOpen: boolean;
  toasts: ToastMessage[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart-items');
      if (saved) {
        dispatch({ type: 'SET_ITEMS', items: JSON.parse(saved) });
      }
    } catch {
      // ignore malformed storage
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('cart-items', JSON.stringify(state.items));
    } catch {
      // ignore storage errors
    }
  }, [state.items, isHydrated]);

  const addItem = useCallback((product: Product) => {
    dispatch({ type: 'ADD_ITEM', product });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const setIsCartOpen = useCallback((open: boolean) => {
    dispatch({ type: 'TOGGLE_CART', open });
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      dispatch({ type: 'ADD_TOAST', toast: { id, message, type } });
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', id });
      }, 3000);
      return () => clearTimeout(timer);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', id });
  }, []);

  const totalItems = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items]
  );

  const totalPrice = useMemo(
    () => state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [state.items]
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isCartOpen: state.isCartOpen,
        toasts: state.toasts,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setIsCartOpen,
        addToast,
        removeToast,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
