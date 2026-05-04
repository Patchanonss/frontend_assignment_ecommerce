'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PriceRangeSlider from './PriceRangeSlider';
import type { Filters as FiltersType, Product } from '@/types';
import { PRICE_MIN_DEFAULT, PRICE_MAX_DEFAULT } from './CatalogPage';

interface FiltersProps {
  filters: FiltersType;
  products: Product[];
  onUpdate: (updates: Partial<FiltersType>) => void;
  onReset: () => void;
}

export default function Filters({ filters, products, onUpdate, onReset }: FiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => onUpdate({ search: value }), 300);
  };

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category))).sort();
    return ['all', ...cats];
  }, [products]);

  const handlePriceChange = useCallback(
    ([priceMin, priceMax]: [number, number]) => {
      onUpdate({ priceMin, priceMax });
    },
    [onUpdate]
  );

  const hasActiveFilters =
    filters.search !== '' ||
    filters.category !== 'all' ||
    filters.priceMin !== PRICE_MIN_DEFAULT ||
    filters.priceMax !== PRICE_MAX_DEFAULT;

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Reset all
            </button>
          )}
        </div>

        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-xs font-medium text-gray-600 mb-2">
            Search
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
              />
            </svg>
            <input
              id="search"
              type="text"
              placeholder="Search products…"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            />
            {searchInput && (
              <button
                onClick={() => { if (debounceTimer.current) clearTimeout(debounceTimer.current); setSearchInput(''); onUpdate({ search: '' }); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Category</p>
          <div className="flex flex-col gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onUpdate({ category: cat })}
                className={`text-left text-sm px-3 py-2 rounded-xl transition-colors ${
                  filters.category === cat
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat === 'all' ? 'All categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Price range</p>
          <PriceRangeSlider
            min={PRICE_MIN_DEFAULT}
            max={PRICE_MAX_DEFAULT}
            value={[filters.priceMin, filters.priceMax]}
            onChange={handlePriceChange}
          />
        </div>
      </div>
    </aside>
  );
}
