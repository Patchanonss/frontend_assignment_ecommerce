export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  rating: number;
  reviewCount: number;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export interface Filters {
  search: string;
  category: string;
  priceMin: number;
  priceMax: number;
}

export interface CartExportData {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  filters: {
    category: string;
    priceRange: string;
    search: string;
  };
  metadata: {
    timestamp: string;
    totalItems: number;
    totalPrice: number;
  };
}
