export interface SaleItemInput {
  variantId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSaleInput {
  items: SaleItemInput[];
  paymentMethod: 'EFECTIVO' | 'MERCADO_PAGO' | 'OTRO';
  observaciones?: string;
}

export interface SaleItem {
  id: string;
  variantId: string;
  productName: string;
  colorName: string;
  sizeName: string;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id: string;
  paymentMethod: string;
  total: number;
  observaciones?: string;
  createdAt: string;
  items: SaleItem[];
}

export interface StockVerificationItem {
  variantId: string;
  productName: string;
  colorName: string;
  sizeName: string;
  available: number;
  requested: number;
  sufficient: boolean;
}
