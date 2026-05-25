import { create } from 'zustand';
import type {
  CategoryOption,
  ColorOption,
  SizeOption,
  PointOfSaleOption,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateColorInput,
  UpdateColorInput,
  CreateSizeInput,
  UpdateSizeInput,
  CreatePointOfSaleInput,
  UpdatePointOfSaleInput,
} from '@/types/settings';
import { apiClient } from '@/lib/api-client';
import { DEFAULT_CATEGORIES, DEFAULT_COLORS, DEFAULT_SIZES } from '@/lib/constants';

interface SettingsState {
  categories: CategoryOption[];
  colors: ColorOption[];
  sizes: SizeOption[];
  pointsOfSale: PointOfSaleOption[];
  isLoading: boolean;
  isSubmitting: boolean;

  fetchCategories: () => Promise<void>;
  fetchColors: () => Promise<void>;
  fetchSizes: () => Promise<void>;
  fetchPointsOfSale: () => Promise<void>;
  fetchAll: () => Promise<void>;

  createCategory: (input: CreateCategoryInput) => Promise<void>;
  updateCategory: (id: string, input: UpdateCategoryInput) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  createColor: (input: CreateColorInput) => Promise<void>;
  updateColor: (id: string, input: UpdateColorInput) => Promise<void>;
  deleteColor: (id: string) => Promise<void>;

  createSize: (input: CreateSizeInput) => Promise<void>;
  updateSize: (id: string, input: UpdateSizeInput) => Promise<void>;
  deleteSize: (id: string) => Promise<void>;

  createPointOfSale: (input: CreatePointOfSaleInput) => Promise<void>;
  updatePointOfSale: (id: string, input: UpdatePointOfSaleInput) => Promise<void>;
  deletePointOfSale: (id: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  colors: DEFAULT_COLORS,
  sizes: DEFAULT_SIZES,
  pointsOfSale: [],
  isLoading: false,
  isSubmitting: false,

  fetchCategories: async () => {
    try {
      const res = await apiClient.get<CategoryOption[]>('/api/v1/settings/categories');
      if (res.data) set({ categories: res.data });
    } catch {
      // keep defaults
    }
  },

  fetchColors: async () => {
    try {
      const res = await apiClient.get<ColorOption[]>('/api/v1/settings/colors');
      if (res.data) set({ colors: res.data });
    } catch {
      // keep defaults
    }
  },

  fetchSizes: async () => {
    try {
      const res = await apiClient.get<SizeOption[]>('/api/v1/settings/sizes');
      if (res.data) set({ sizes: res.data });
    } catch {
      // keep defaults
    }
  },

  fetchPointsOfSale: async () => {
    try {
      const res = await apiClient.get<PointOfSaleOption[]>('/api/v1/settings/points-of-sale');
      if (res.data) set({ pointsOfSale: res.data });
    } catch {
      // keep defaults (empty)
    }
  },

  fetchAll: async () => {
    set({ isLoading: true });
    await Promise.all([
      get().fetchCategories(),
      get().fetchColors(),
      get().fetchSizes(),
      get().fetchPointsOfSale(),
    ]);
    set({ isLoading: false });
  },

  createCategory: async (input) => {
    set({ isSubmitting: true });
    try {
      const res = await apiClient.post<CategoryOption>('/api/v1/settings/categories', input);
      if (res.data) {
        set((state) => ({
          categories: [...state.categories, res.data!].sort((a, b) => a.name.localeCompare(b.name)),
        }));
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateCategory: async (id, input) => {
    set({ isSubmitting: true });
    try {
      const res = await apiClient.put<CategoryOption>(`/api/v1/settings/categories/${id}`, input);
      if (res.data) {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? res.data! : c)),
        }));
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteCategory: async (id) => {
    set({ isSubmitting: true });
    try {
      await apiClient.delete(`/api/v1/settings/categories/${id}`);
      set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
    } finally {
      set({ isSubmitting: false });
    }
  },

  createColor: async (input) => {
    set({ isSubmitting: true });
    try {
      const res = await apiClient.post<ColorOption>('/api/v1/settings/colors', input);
      if (res.data) {
        set((state) => ({
          colors: [...state.colors, res.data!].sort((a, b) => a.name.localeCompare(b.name)),
        }));
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateColor: async (id, input) => {
    set({ isSubmitting: true });
    try {
      const res = await apiClient.put<ColorOption>(`/api/v1/settings/colors/${id}`, input);
      if (res.data) {
        set((state) => ({
          colors: state.colors.map((c) => (c.id === id ? res.data! : c)),
        }));
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteColor: async (id) => {
    set({ isSubmitting: true });
    try {
      await apiClient.delete(`/api/v1/settings/colors/${id}`);
      set((state) => ({ colors: state.colors.filter((c) => c.id !== id) }));
    } finally {
      set({ isSubmitting: false });
    }
  },

  createSize: async (input) => {
    set({ isSubmitting: true });
    try {
      const res = await apiClient.post<SizeOption>('/api/v1/settings/sizes', input);
      if (res.data) {
        set((state) => ({
          sizes: [...state.sizes, res.data!].sort((a, b) => a.name.localeCompare(b.name)),
        }));
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateSize: async (id, input) => {
    set({ isSubmitting: true });
    try {
      const res = await apiClient.put<SizeOption>(`/api/v1/settings/sizes/${id}`, input);
      if (res.data) {
        set((state) => ({
          sizes: state.sizes.map((s) => (s.id === id ? res.data! : s)),
        }));
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteSize: async (id) => {
    set({ isSubmitting: true });
    try {
      await apiClient.delete(`/api/v1/settings/sizes/${id}`);
      set((state) => ({ sizes: state.sizes.filter((s) => s.id !== id) }));
    } finally {
      set({ isSubmitting: false });
    }
  },

  createPointOfSale: async (input) => {
    set({ isSubmitting: true });
    try {
      const res = await apiClient.post<PointOfSaleOption>('/api/v1/settings/points-of-sale', input);
      if (res.data) {
        set((state) => ({
          pointsOfSale: [...state.pointsOfSale, res.data!].sort((a, b) => a.name.localeCompare(b.name)),
        }));
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  updatePointOfSale: async (id, input) => {
    set({ isSubmitting: true });
    try {
      const res = await apiClient.put<PointOfSaleOption>(`/api/v1/settings/points-of-sale/${id}`, input);
      if (res.data) {
        set((state) => ({
          pointsOfSale: state.pointsOfSale.map((p) => (p.id === id ? res.data! : p)),
        }));
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  deletePointOfSale: async (id) => {
    set({ isSubmitting: true });
    try {
      await apiClient.delete(`/api/v1/settings/points-of-sale/${id}`);
      set((state) => ({ pointsOfSale: state.pointsOfSale.filter((p) => p.id !== id) }));
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
