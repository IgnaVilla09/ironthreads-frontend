import { create } from 'zustand';
import {
  Product,
  ProductFilters,
  CreateProductInput,
  UpdateProductInput,
  CreateVariantInput,
  UpdateVariantInput,
  ProductVariant,
} from '@/types/product';
import { PaginationMeta } from '@/types/api';
import { apiClient } from '@/lib/api-client';

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  filters: ProductFilters;
  searchQuery: string;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isSubmitting: boolean;

  fetchProducts: (page?: number) => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (input: CreateProductInput) => Promise<Product>;
  updateProduct: (id: string, input: UpdateProductInput) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;

  createVariant: (productId: string, input: CreateVariantInput) => Promise<ProductVariant>;
  updateVariant: (variantId: string, input: UpdateVariantInput) => Promise<ProductVariant>;
  deleteVariant: (productId: string, variantId: string) => Promise<void>;

  setFilters: (filters: Partial<ProductFilters>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  resetSelectedProduct: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  selectedProduct: null,
  filters: {},
  searchQuery: '',
  pagination: null,
  isLoading: false,
  isError: false,
  errorMessage: null,
  isSubmitting: false,

  fetchProducts: async (page = 1) => {
    set({ isLoading: true, isError: false, errorMessage: null });
    try {
      const { filters, searchQuery } = get();
      const response = await apiClient.get<Product[]>('/api/v1/products', {
        ...filters,
        search: searchQuery || undefined,
        page,
        limit: 8,
      });
      set({
        products: response.data ?? [],
        pagination: response.meta ?? null,
        isLoading: false,
      });
    } catch (error) {
      set({
        isError: true,
        errorMessage: error instanceof Error ? error.message : 'Error al cargar productos',
        isLoading: false,
      });
    }
  },

  fetchProduct: async (id: string) => {
    set({ isLoading: true, isError: false, errorMessage: null });
    try {
      const response = await apiClient.get<Product>(`/api/v1/products/${id}`);
      if (!response.data) throw new Error('Producto no encontrado');
      set({ selectedProduct: response.data, isLoading: false });
    } catch (error) {
      set({
        isError: true,
        errorMessage: error instanceof Error ? error.message : 'Error al cargar producto',
        isLoading: false,
      });
    }
  },

  createProduct: async (input: CreateProductInput) => {
    set({ isSubmitting: true });
    try {
      const response = await apiClient.post<Product>('/api/v1/products', input);
      if (!response.data) throw new Error('Error al crear producto');
      set((state) => ({
        products: [response.data!, ...state.products],
        isSubmitting: false,
      }));
      return response.data;
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  updateProduct: async (id: string, input: UpdateProductInput) => {
    set({ isSubmitting: true });
    try {
      const response = await apiClient.put<Product>(`/api/v1/products/${id}`, input);
      if (!response.data) throw new Error('Error al actualizar producto');
      const updated = response.data;
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updated : p)),
        selectedProduct: updated,
        isSubmitting: false,
      }));
      return updated;
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    set({ isSubmitting: true });
    try {
      await apiClient.delete(`/api/v1/products/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
    } catch (error) {
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  createVariant: async (productId: string, input: CreateVariantInput) => {
    set({ isSubmitting: true });
    try {
      const response = await apiClient.post<ProductVariant>(
        `/api/v1/products/${productId}/variants`,
        input
      );
      if (!response.data) throw new Error('Error al crear variante');
      const updated = response.data;
      set((state) => ({
        products: state.products.map((p) =>
          p.id === productId
            ? {
                ...p,
                variants: p.variants.some((v) => v.id === updated.id)
                  ? p.variants.map((v) => (v.id === updated.id ? updated : v))
                  : [...p.variants, updated],
              }
            : p
        ),
        selectedProduct: state.selectedProduct?.id === productId
          ? {
              ...state.selectedProduct,
              variants: state.selectedProduct.variants.some((v) => v.id === updated.id)
                ? state.selectedProduct.variants.map((v) => (v.id === updated.id ? updated : v))
                : [...state.selectedProduct.variants, updated],
            }
          : state.selectedProduct,
      }));
      return updated;
    } catch (error) {
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateVariant: async (variantId: string, input: UpdateVariantInput) => {
    set({ isSubmitting: true });
    try {
      const variant = get().selectedProduct?.variants.find((v) => v.id === variantId);
      if (!variant) throw new Error('Variante no encontrada');

      const response = await apiClient.put<ProductVariant>(
        `/api/v1/products/${variant.productId}/variants/${variantId}`,
        input
      );
      if (!response.data) throw new Error('Error al actualizar variante');
      const updated = response.data;

      set((state) => ({
        products: state.products.map((p) => ({
          ...p,
          variants: p.variants.map((v) => (v.id === variantId ? updated : v)),
        })),
        selectedProduct: state.selectedProduct
          ? {
              ...state.selectedProduct,
              variants: state.selectedProduct.variants.map((v) =>
                v.id === variantId ? updated : v
              ),
            }
          : null,
      }));
      return updated;
    } catch (error) {
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteVariant: async (productId: string, variantId: string) => {
    set({ isSubmitting: true });
    try {
      await apiClient.delete(
        `/api/v1/products/${productId}/variants/${variantId}`
      );

      set((state) => ({
        products: state.products.map((p) => ({
          ...p,
          variants: p.variants.filter((v) => v.id !== variantId),
        })),
        selectedProduct: state.selectedProduct
          ? {
              ...state.selectedProduct,
              variants: state.selectedProduct.variants.filter(
                (v) => v.id !== variantId
              ),
            }
          : null,
      }));
    } catch (error) {
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  clearFilters: () => {
    set({ filters: {}, searchQuery: '' });
  },

  resetSelectedProduct: () => {
    set({ selectedProduct: null });
  },
}));
