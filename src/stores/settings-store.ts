import { create } from 'zustand';
import type {
  CategoryOption,
  ColorOption,
  SizeOption,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateColorInput,
  UpdateColorInput,
  CreateSizeInput,
  UpdateSizeInput,
} from '@/types/settings';
import { apiClient } from '@/lib/api-client';
import { DEFAULT_CATEGORIES, DEFAULT_COLORS, DEFAULT_SIZES } from '@/lib/constants';

interface SettingsState {
  categories: CategoryOption[];
  colors: ColorOption[];
  sizes: SizeOption[];
  isLoading: boolean;
  isSubmitting: boolean;

  fetchCategories: () => Promise<void>;
  fetchColors: () => Promise<void>;
  fetchSizes: () => Promise<void>;
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
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  colors: DEFAULT_COLORS,
  sizes: DEFAULT_SIZES,
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

  fetchAll: async () => {
    set({ isLoading: true });
    await Promise.all([
      get().fetchCategories(),
      get().fetchColors(),
      get().fetchSizes(),
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
}));
