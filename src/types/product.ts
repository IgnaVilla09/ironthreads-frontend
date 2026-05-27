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
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
}

export interface InventoryItem {
  id: string;
  variantId: string;
  pointOfSaleId: string;
  depositoId: string | null;
  stock: number;
  variant: ProductVariant;
  pointOfSale: PointOfSaleOption;
  deposito: DepositoOption | null;
}

export interface InventoryItemSummary {
  pointOfSaleId: string;
  pointOfSale: PointOfSaleOption;
  deposito: DepositoOption | null;
  stock: number;
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

export interface InventoryAllocation {
  pointOfSaleId: string;
  depositoId?: string;
  stock: number;
}

export interface CreateVariantInput {
  colorId: string;
  sizeId: string;
  inventory?: InventoryAllocation[];
}

export interface UpdateVariantInput {
  colorId?: string;
  sizeId?: string;
}

export interface ProductFilters {
  categoryId?: string;
  search?: string;
}

export interface StockTransfer {
  id: string;
  variantId: string;
  fromPointOfSaleId: string;
  fromDepositoId: string | null;
  toPointOfSaleId: string;
  toDepositoId: string | null;
  quantity: number;
  createdAt: string;
  variant: {
    sku: string;
    product: { id: string; name: string };
    color: { id: string; name: string; label: string; hex: string | null };
    size: { id: string; name: string; label: string };
  };
  fromPointOfSale: PointOfSaleOption;
  fromDeposito: DepositoOption | null;
  toPointOfSale: PointOfSaleOption;
  toDeposito: DepositoOption | null;
}

export interface CreateTransferInput {
  variantId: string;
  fromPointOfSaleId: string;
  fromDepositoId?: string;
  toPointOfSaleId: string;
  toDepositoId?: string;
  quantity: number;
}
