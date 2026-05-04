import { flattenObject } from '@/utils/flattenObject';

describe('flattenObject', () => {
  it('flattens a shallow object', () => {
    expect(flattenObject({ a: 1, b: 'hello' })).toEqual({ a: 1, b: 'hello' });
  });

  it('flattens nested objects with dot notation', () => {
    expect(flattenObject({ filters: { category: 'Electronics', priceRange: '$200+' } })).toEqual({
      'filters.category': 'Electronics',
      'filters.priceRange': '$200+',
    });
  });

  it('flattens arrays with index keys', () => {
    expect(
      flattenObject({
        items: [
          { id: 'prod_001', name: 'Monitor', price: 999.99, quantity: 1 },
          { id: 'prod_002', name: 'T-Shirt', price: 22.30, quantity: 2 },
        ],
      })
    ).toEqual({
      'items.0.id': 'prod_001',
      'items.0.name': 'Monitor',
      'items.0.price': 999.99,
      'items.0.quantity': 1,
      'items.1.id': 'prod_002',
      'items.1.name': 'T-Shirt',
      'items.1.price': 22.30,
      'items.1.quantity': 2,
    });
  });

  it('handles null values', () => {
    expect(flattenObject({ a: null })).toEqual({ a: null });
  });

  it('handles deeply nested objects', () => {
    expect(flattenObject({ a: { b: { c: 42 } } })).toEqual({ 'a.b.c': 42 });
  });

  it('matches the assignment example exactly', () => {
    const cart = {
      items: [
        { id: 'prod_123', name: 'Gaming Monitor', price: 999.99, quantity: 1 },
        { id: 'prod_456', name: 'T-Shirt', price: 22.30, quantity: 2 },
      ],
      filters: {
        category: 'electronics',
        priceRange: '$200+',
      },
      metadata: {
        timestamp: '2026-01-15T10:00:00Z',
      },
    };

    expect(flattenObject(cart)).toEqual({
      'items.0.id': 'prod_123',
      'items.0.name': 'Gaming Monitor',
      'items.0.price': 999.99,
      'items.0.quantity': 1,
      'items.1.id': 'prod_456',
      'items.1.name': 'T-Shirt',
      'items.1.price': 22.30,
      'items.1.quantity': 2,
      'filters.category': 'electronics',
      'filters.priceRange': '$200+',
      'metadata.timestamp': '2026-01-15T10:00:00Z',
    });
  });

  it('returns empty object for empty input', () => {
    expect(flattenObject({})).toEqual({});
  });
});
