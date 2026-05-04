'use client';

import { useMemo, useCallback, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { flattenObject } from '@/utils/flattenObject';
import type { CartExportData } from '@/types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  activePriceRange: string;
  activeSearch: string;
}

export default function ExportModal({
  isOpen,
  onClose,
  activeCategory,
  activePriceRange,
  activeSearch,
}: ExportModalProps) {
  const { items, totalItems, totalPrice } = useCart();

  const exportData: CartExportData = useMemo(
    () => ({
      items: items.map(({ product, quantity }) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
      })),
      filters: {
        category: activeCategory,
        priceRange: activePriceRange,
        search: activeSearch,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        totalItems,
        totalPrice: Math.round(totalPrice * 100) / 100,
      },
    }),
    [items, totalItems, totalPrice, activeCategory, activePriceRange, activeSearch]
  );

  const flatData = useMemo(
    () => flattenObject(exportData as unknown as Record<string, unknown>),
    [exportData]
  );

  const jsonString = useMemo(
    () => JSON.stringify(flatData, null, 2),
    [flatData]
  );

  const handleDownload = useCallback(() => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cart-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [jsonString]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Cart export"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Export Cart</h2>
            <p className="text-xs text-gray-500 mt-0.5">Flattened dot-notation format</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Code */}
        <div className="flex-1 overflow-auto p-4">
          <pre className="bg-gray-950 text-green-400 rounded-xl p-4 text-xs leading-relaxed overflow-x-auto font-mono">
            {jsonString}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download JSON
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
