import type { CategoryOption, ColorOption, SizeOption } from './settings';

export interface ProductVariant {
  id: string;
  productId: string;
  colorId: string;
  sizeId: string;
  color: ColorOption;
  size: SizeOption;
  sku: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  category: CategoryOption;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
}

export interface CreateProductInput {
  name: string;
  description?: string;
  categoryId: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  categoryId?: string;
}

export interface CreateVariantInput {
  colorId: string;
  sizeId: string;
  stock: number;
}

export interface UpdateVariantInput {
  colorId?: string;
  sizeId?: string;
  stock?: number;
}

export interface ProductFilters {
  categoryId?: string;
  search?: string;
}
