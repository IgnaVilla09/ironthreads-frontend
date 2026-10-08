export interface SaleItemInput {
  variantId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSaleInput {
  items: SaleItemInput[];
  paymentMethod: 'EFECTIVO' | 'MERCADO_PAGO' | 'OTRO';
  pointOfSaleId: string;
  depositoId?: string | null;
  observaciones?: string;
}

export interface SaleItem {
  id: string;
  variantId: string | null;
  inventoryItemId: string | null;
  productName: string;
  colorName: string;
  sizeName: string;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id: string;
  pointOfSaleId: string | null;
  depositoId: string | null;
  pointOfSale?: { id: string; name: string; label: string };
  deposito?: { id: string; name: string; label: string };
  paymentMethod: string;
  total: number;
  observaciones?: string;
  createdAt: string;
  revision: number;
  editedAt: string | null;
  items: SaleItem[];
}

export interface SaleEditInput {
  requestId: string;
  revision: number;
  reason: string;
  settled: true;
  paymentMethod: CreateSaleInput['paymentMethod'] | null;
  returns: { saleItemId: string; quantity: number; depositoId: string | null; originalUnitPrice?: number }[];
  deliveries: { inventoryItemId: string; quantity: number; unitPrice: number }[];
}

export interface SaleEdit {
  id: string;
  revision: number;
  actorName: string;
  createdAt: string;
  reason: string;
  regularization: number;
  difference: number;
  paymentMethod: string | null;
  before: Sale;
  after: Sale;
  movements: {
    direction: 'RETURN' | 'DELIVERY'; productName: string; colorName: string; sizeName: string;
    depositoLabel: string; quantity: number; unitPrice: number;
  }[];
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
