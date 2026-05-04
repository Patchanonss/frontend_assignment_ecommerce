import { cartReducer, initialCartState } from '@/context/cartReducer';
import type { CartState } from '@/context/cartReducer';
import type { Product } from '@/types';

const mockProduct: Product = {
  id: 'prod_001',
  name: 'Gaming Monitor',
  price: 999.99,
  category: 'Electronics',
  image: '/test.jpg',
  description: 'A great monitor',
  rating: 4.8,
  reviewCount: 100,
  stock: 10,
};

const mockProduct2: Product = {
  id: 'prod_002',
  name: 'T-Shirt',
  price: 22.30,
  category: 'Clothing',
  image: '/test2.jpg',
  description: 'A comfy shirt',
  rating: 4.2,
  reviewCount: 50,
  stock: 100,
};

describe('cartReducer', () => {
  describe('ADD_ITEM', () => {
    it('adds a new item with quantity 1', () => {
      const state = cartReducer(initialCartState, { type: 'ADD_ITEM', product: mockProduct });
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual({ product: mockProduct, quantity: 1 });
    });

    it('increments quantity if item already exists', () => {
      const withOne = cartReducer(initialCartState, { type: 'ADD_ITEM', product: mockProduct });
      const withTwo = cartReducer(withOne, { type: 'ADD_ITEM', product: mockProduct });
      expect(withTwo.items).toHaveLength(1);
      expect(withTwo.items[0].quantity).toBe(2);
    });

    it('adds multiple different products independently', () => {
      const s1 = cartReducer(initialCartState, { type: 'ADD_ITEM', product: mockProduct });
      const s2 = cartReducer(s1, { type: 'ADD_ITEM', product: mockProduct2 });
      expect(s2.items).toHaveLength(2);
    });
  });

  describe('REMOVE_ITEM', () => {
    it('removes the item by id', () => {
      const withItem = cartReducer(initialCartState, { type: 'ADD_ITEM', product: mockProduct });
      const state = cartReducer(withItem, { type: 'REMOVE_ITEM', productId: 'prod_001' });
      expect(state.items).toHaveLength(0);
    });

    it('only removes the matching item', () => {
      const s1 = cartReducer(initialCartState, { type: 'ADD_ITEM', product: mockProduct });
      const s2 = cartReducer(s1, { type: 'ADD_ITEM', product: mockProduct2 });
      const s3 = cartReducer(s2, { type: 'REMOVE_ITEM', productId: 'prod_001' });
      expect(s3.items).toHaveLength(1);
      expect(s3.items[0].product.id).toBe('prod_002');
    });
  });

  describe('UPDATE_QUANTITY', () => {
    it('updates the quantity of an item', () => {
      const withItem = cartReducer(initialCartState, { type: 'ADD_ITEM', product: mockProduct });
      const state = cartReducer(withItem, { type: 'UPDATE_QUANTITY', productId: 'prod_001', quantity: 5 });
      expect(state.items[0].quantity).toBe(5);
    });

    it('removes item when quantity is set to 0', () => {
      const withItem = cartReducer(initialCartState, { type: 'ADD_ITEM', product: mockProduct });
      const state = cartReducer(withItem, { type: 'UPDATE_QUANTITY', productId: 'prod_001', quantity: 0 });
      expect(state.items).toHaveLength(0);
    });

    it('removes item when quantity is negative', () => {
      const withItem = cartReducer(initialCartState, { type: 'ADD_ITEM', product: mockProduct });
      const state = cartReducer(withItem, { type: 'UPDATE_QUANTITY', productId: 'prod_001', quantity: -1 });
      expect(state.items).toHaveLength(0);
    });
  });

  describe('CLEAR_CART', () => {
    it('empties all items', () => {
      const s1 = cartReducer(initialCartState, { type: 'ADD_ITEM', product: mockProduct });
      const s2 = cartReducer(s1, { type: 'ADD_ITEM', product: mockProduct2 });
      const cleared = cartReducer(s2, { type: 'CLEAR_CART' });
      expect(cleared.items).toHaveLength(0);
    });
  });

  describe('TOGGLE_CART', () => {
    it('opens the cart', () => {
      const state = cartReducer(initialCartState, { type: 'TOGGLE_CART', open: true });
      expect(state.isCartOpen).toBe(true);
    });

    it('closes the cart', () => {
      const opened = cartReducer(initialCartState, { type: 'TOGGLE_CART', open: true });
      const closed = cartReducer(opened, { type: 'TOGGLE_CART', open: false });
      expect(closed.isCartOpen).toBe(false);
    });
  });

  describe('derived totals', () => {
    it('calculates total items and price correctly', () => {
      const s1 = cartReducer(initialCartState, { type: 'ADD_ITEM', product: mockProduct });
      const s2 = cartReducer(s1, { type: 'ADD_ITEM', product: mockProduct });
      const s3 = cartReducer(s2, { type: 'ADD_ITEM', product: mockProduct2 });

      const totalItems = s3.items.reduce((sum, i) => sum + i.quantity, 0);
      const totalPrice = s3.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

      expect(totalItems).toBe(3);
      expect(totalPrice).toBeCloseTo(999.99 * 2 + 22.30, 2);
    });
  });
});
