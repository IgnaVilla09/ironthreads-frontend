import type { CategoryOption, ColorOption, SizeOption, PointOfSaleOption, DepositoOption } from './settings';

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
  pointOfSaleId: string;
  pointOfSale: PointOfSaleOption;
  depositoId: string | null;
  deposito: DepositoOption | null;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
}

export interface CreateProductInput {
  name: string;
  description?: string;
  categoryId: string;
  pointOfSaleId: string;
  depositoId?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  categoryId?: string;
  pointOfSaleId?: string;
  depositoId?: string | null;
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
  pointOfSaleId?: string;
  depositoId?: string;
  search?: string;
}
