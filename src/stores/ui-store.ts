import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ProductListSelection {
  key: string;
  page: number;
}

interface UiState {
  sidebarOpen: boolean;
  productListSelection: ProductListSelection;
  salesHistoryPage: number;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setProductListSelection: (selection: ProductListSelection) => void;
  setSalesHistoryPage: (page: number) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      productListSelection: { key: '', page: 1 },
      salesHistoryPage: 1,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setProductListSelection: (selection) => set({ productListSelection: selection }),
      setSalesHistoryPage: (page) => set({ salesHistoryPage: page }),
    }),
    {
      name: 'iron-list-navigation',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        productListSelection: state.productListSelection,
        salesHistoryPage: state.salesHistoryPage,
      }),
    }
  )
);
