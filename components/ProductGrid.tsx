'use client';

import { useMemo, useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';
import type { Product, Filters } from '@/types';
import { PRICE_MAX_DEFAULT, PRICE_MIN_DEFAULT } from './CatalogPage';

interface ProductGridProps {
  products: Product[];
  filters: Filters;
}

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

export default function ProductGrid({ products, filters }: ProductGridProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial load
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => applyFilters(products, filters), [products, filters]);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.category !== 'all' ||
    filters.priceMin !== PRICE_MIN_DEFAULT ||
    filters.priceMax !== PRICE_MAX_DEFAULT;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <svg
          className="w-16 h-16 text-gray-300 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-700 mb-1">No products found</h3>
        <p className="text-gray-400 text-sm max-w-xs">
          {hasActiveFilters
            ? 'Try adjusting your filters or search term.'
            : 'Check back later for new arrivals.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
