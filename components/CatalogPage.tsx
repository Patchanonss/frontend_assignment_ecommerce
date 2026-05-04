'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import productsData from '@/data/products.json';
import type { Product, Filters as FilterState } from '@/types';
import Filters from './Filters';
import ProductGrid from './ProductGrid';
import Cart from './Cart';

const products = productsData as Product[];

export const PRICE_MIN_DEFAULT = 0;
export const PRICE_MAX_DEFAULT = 1500;

function readUrlFilters(params: URLSearchParams): Partial<FilterState> {
  const out: Partial<FilterState> = {};
  const category = params.get('category');
  const priceMin = params.get('priceMin');
  const priceMax = params.get('priceMax');
  if (category) out.category = category;
  if (priceMin) out.priceMin = Number(priceMin);
  if (priceMax) out.priceMax = Number(priceMax);
  return out;
}

export default function CatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>(() => ({
    search: '',
    category: 'all',
    priceMin: PRICE_MIN_DEFAULT,
    priceMax: PRICE_MAX_DEFAULT,
    ...readUrlFilters(searchParams),
  }));

  // Sync category + price to URL whenever they change.
  // Search is intentionally excluded — it's ephemeral, not shareable.
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category !== 'all') params.set('category', filters.category);
    if (filters.priceMin !== PRICE_MIN_DEFAULT) params.set('priceMin', String(filters.priceMin));
    if (filters.priceMax !== PRICE_MAX_DEFAULT) params.set('priceMax', String(filters.priceMax));
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '/', { scroll: false });
  }, [filters.category, filters.priceMin, filters.priceMax]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilters = (updates: Partial<FilterState>) =>
    setFilters((prev) => ({ ...prev, ...updates }));

  const resetFilters = () =>
    setFilters({ search: '', category: 'all', priceMin: PRICE_MIN_DEFAULT, priceMax: PRICE_MAX_DEFAULT });

  const activePriceRange = useMemo(() => {
    const { priceMin, priceMax } = filters;
    if (priceMin === PRICE_MIN_DEFAULT && priceMax === PRICE_MAX_DEFAULT) return 'all';
    return `$${priceMin}–$${priceMax}`;
  }, [filters]);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Product Catalog</h1>
          <p className="text-gray-500 mt-1">
            {products.length} products across{' '}
            {new Set(products.map((p) => p.category)).size} categories
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <Filters
            filters={filters}
            products={products}
            onUpdate={updateFilters}
            onReset={resetFilters}
          />
          <div className="flex-1 min-w-0">
            <ProductGrid products={products} filters={filters} />
          </div>
        </div>
      </div>

      <Cart
        activeCategory={filters.category}
        activePriceRange={activePriceRange}
        activeSearch={filters.search}
      />
    </>
  );
}
