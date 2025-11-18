import { Image, Status } from './common';

export interface Product {
  id: string;
  storeId: string;
  title: string;
  description?: string;
  handle: string;
  status: Status;
  variants: ProductVariant[];
  images: Image[];
  categoryId?: string;
  category?: Category;
  tags: string[];
  vendor?: string;
  productType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  title: string;
  sku?: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  inventoryQty: number;
  inventoryPolicy: 'deny' | 'continue';
  weight?: number;
  weightUnit?: 'kg' | 'lb' | 'oz' | 'g';
  options: Record<string, string>;
  image?: Image;
  createdAt: string;
  updatedAt: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: Image;
  productsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormValues {
  title: string;
  description?: string;
  status: Status;
  variants: ProductVariantInput[];
  images: Image[];
  categoryId?: string;
  tags: string[];
  vendor?: string;
  productType?: string;
  options: ProductOption[];
}

export interface ProductVariantInput {
  title: string;
  sku?: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  inventoryQty: number;
  inventoryPolicy: 'deny' | 'continue';
  weight?: number;
  weightUnit?: 'kg' | 'lb' | 'oz' | 'g';
  options: Record<string, string>;
}

export interface ProductFilters {
  search?: string;
  status?: Status;
  categoryId?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}
