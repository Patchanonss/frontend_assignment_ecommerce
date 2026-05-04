import type { Product, Filters } from '@/types';
import { PRICE_MIN_DEFAULT, PRICE_MAX_DEFAULT } from '@/components/CatalogPage';

const allFilters: Filters = {
  search: '',
  category: 'all',
  priceMin: PRICE_MIN_DEFAULT,
  priceMax: PRICE_MAX_DEFAULT,
};

// Mirror of the filter logic in ProductGrid — tested here as a pure function
function applyFilters(products: Product[], filters: Filters): Product[] {
  const searchLower = filters.search.toLowerCase().trim();
  return products.filter((p) => {
    if (searchLower && !p.name.toLowerCase().includes(searchLower)) return false;
    if (filters.category !== 'all' && p.category !== filters.category) return false;
    if (p.price < filters.priceMin) return false;
    if (p.price > filters.priceMax) return false;
    return true;
  });
}

const makeProduct = (overrides: Partial<Product>): Product => ({
  id: 'prod_test',
  name: 'Test Product',
  price: 100,
  category: 'Electronics',
  image: '/img.jpg',
  description: '',
  rating: 4,
  reviewCount: 10,
  stock: 5,
  ...overrides,
});

const products: Product[] = [
  makeProduct({ id: '1', name: 'Gaming Monitor', price: 999.99, category: 'Electronics' }),
  makeProduct({ id: '2', name: 'T-Shirt', price: 22.30, category: 'Clothing' }),
  makeProduct({ id: '3', name: 'Yoga Mat', price: 68.99, category: 'Sports' }),
  makeProduct({ id: '4', name: 'Cast Iron Skillet', price: 44.99, category: 'Home & Kitchen' }),
  makeProduct({ id: '5', name: 'Mechanical Keyboard', price: 129.99, category: 'Electronics' }),
];

describe('product filter', () => {
  it('returns all products when no filters are active', () => {
    expect(applyFilters(products, allFilters)).toHaveLength(5);
  });

  describe('search', () => {
    it('filters by name case-insensitively', () => {
      const result = applyFilters(products, { ...allFilters, search: 'monitor' });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Gaming Monitor');
    });

    it('returns empty array when no products match search', () => {
      const result = applyFilters(products, { ...allFilters, search: 'zzznomatch' });
      expect(result).toHaveLength(0);
    });

    it('matches partial names', () => {
      const result = applyFilters(products, { ...allFilters, search: 'key' });
      expect(result[0].name).toBe('Mechanical Keyboard');
    });
  });

  describe('category', () => {
    it('filters to a single category', () => {
      const result = applyFilters(products, { ...allFilters, category: 'Electronics' });
      expect(result).toHaveLength(2);
      result.forEach((p) => expect(p.category).toBe('Electronics'));
    });

    it('"all" returns every product', () => {
      const result = applyFilters(products, { ...allFilters, category: 'all' });
      expect(result).toHaveLength(5);
    });
  });

  describe('price range', () => {
    it('filters out products below priceMin', () => {
      const result = applyFilters(products, { ...allFilters, priceMin: 50 });
      result.forEach((p) => expect(p.price).toBeGreaterThanOrEqual(50));
    });

    it('filters out products above priceMax', () => {
      const result = applyFilters(products, { ...allFilters, priceMax: 100 });
      result.forEach((p) => expect(p.price).toBeLessThanOrEqual(100));
    });

    it('filters between min and max', () => {
      const result = applyFilters(products, { ...allFilters, priceMin: 40, priceMax: 130 });
      expect(result.map((p) => p.name).sort()).toEqual(
        ['Cast Iron Skillet', 'Mechanical Keyboard', 'Yoga Mat'].sort()
      );
    });
  });

  describe('combined filters', () => {
    it('applies search and category together', () => {
      const result = applyFilters(products, { ...allFilters, search: 'key', category: 'Electronics' });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Mechanical Keyboard');
    });

    it('returns empty when combined filters match nothing', () => {
      const result = applyFilters(products, { ...allFilters, search: 'monitor', category: 'Clothing' });
      expect(result).toHaveLength(0);
    });
  });
});
