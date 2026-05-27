import { create } from 'zustand';
import {
  InventoryItem,
  StockTransfer,
  CreateTransferInput,
} from '@/types/product';
import { PaginationMeta } from '@/types/api';
import { apiClient } from '@/lib/api-client';

interface InventoryState {
  inventory: InventoryItem[];
  transfers: StockTransfer[];
  transferPagination: PaginationMeta | null;
  isLoading: boolean;
  isSubmitting: boolean;

  fetchInventory: (params?: Record<string, string>) => Promise<void>;
  fetchInventoryByVariant: (variantId: string) => Promise<InventoryItem[]>;
  createTransfer: (input: CreateTransferInput) => Promise<void>;
  setVariantInventory: (variantId: string, items: { pointOfSaleId: string; depositoId?: string | null; stock: number }[]) => Promise<void>;
  fetchTransfers: (page?: number, params?: Record<string, string>) => Promise<void>;

  reset: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  inventory: [],
  transfers: [],
  transferPagination: null,
  isLoading: false,
  isSubmitting: false,

  fetchInventory: async (params) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get<InventoryItem[]>('/api/v1/inventory', params);
      set({ inventory: response.data ?? [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchInventoryByVariant: async (variantId: string) => {
    try {
      const response = await apiClient.get<InventoryItem[]>(`/api/v1/inventory/variants/${variantId}`);
      return response.data ?? [];
    } catch {
      return [];
    }
  },

  createTransfer: async (input: CreateTransferInput) => {
    set({ isSubmitting: true });
    try {
      await apiClient.post('/api/v1/inventory/transfer', input);
    } finally {
      set({ isSubmitting: false });
    }
  },

  setVariantInventory: async (variantId, items) => {
    set({ isSubmitting: true });
    try {
      await apiClient.put(`/api/v1/inventory/variants/${variantId}`, { items });
    } finally {
      set({ isSubmitting: false });
    }
  },

  fetchTransfers: async (page = 1, params) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get<StockTransfer[]>('/api/v1/inventory/transfers', {
        ...params,
        page,
        limit: 10,
      });
      set({
        transfers: response.data ?? [],
        transferPagination: response.meta ?? null,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set({ inventory: [], transfers: [], transferPagination: null });
  },
}));
