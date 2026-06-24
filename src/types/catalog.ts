export type CatalogOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_REPORTED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'OUT_OF_STOCK';

export interface CatalogOrderItem {
  id: string;
  productId: string;
  variantId: string;
  productNameSnapshot: string;
  colorNameSnapshot: string;
  sizeNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  createdAt: string;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    price: number | null;
  };
}

export interface CatalogOrder {
  id: string;
  pointOfSaleId: string;
  saleId: string | null;
  status: CatalogOrderStatus;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  paymentMethod: 'MERCADO_PAGO';
  total: number;
  notes: string | null;
  whatsAppProofSent: boolean;
  confirmedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  pointOfSale: {
    id: string;
    name: string;
    label: string;
  };
  sale: {
    id: string;
    total: number;
    createdAt: string;
  } | null;
  items: CatalogOrderItem[];
}
