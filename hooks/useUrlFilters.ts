'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { Filters } from '@/types';

export const PRICE_MIN_DEFAULT = 0;
export const PRICE_MAX_DEFAULT = 1500;

export function useUrlFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: Filters = useMemo(
    () => ({
      search: searchParams.get('search') ?? '',
      category: searchParams.get('category') ?? 'all',
      priceMin: Number(searchParams.get('priceMin') ?? PRICE_MIN_DEFAULT),
      priceMax: Number(searchParams.get('priceMax') ?? PRICE_MAX_DEFAULT),
    }),
    [searchParams]
  );

  const updateFilters = useCallback(
    (updates: Partial<Filters>) => {
      const params = new URLSearchParams(searchParams.toString());

      (Object.entries(updates) as [keyof Filters, Filters[keyof Filters]][]).forEach(
        ([key, value]) => {
          const isDefault =
            value === '' ||
            value === 'all' ||
            (key === 'priceMin' && value === PRICE_MIN_DEFAULT) ||
            (key === 'priceMax' && value === PRICE_MAX_DEFAULT);

          if (isDefault) {
            params.delete(key);
          } else {
            params.set(key, String(value));
          }
        }
      );

      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '/', { scroll: false });
    },
    [router, searchParams]
  );

  const resetFilters = useCallback(() => {
    router.replace('/', { scroll: false });
  }, [router]);

  return { filters, updateFilters, resetFilters };
}
