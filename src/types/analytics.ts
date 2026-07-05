export interface SizeDistribution {
  sizeId: string;
  sizeName: string;
  totalStock: number;
  productCount: number;
}

export interface ColorDistribution {
  colorId: string;
  colorName: string;
  totalStock: number;
  productCount: number;
  hex: string | null;
}

export interface LowStockProduct {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  totalStock: number;
  variantsCount: number;
  category: {
    id: string;
    name: string;
    label: string;
  };
}

export interface BestSellingSize {
  sizeName: string;
  totalSold: number;
  saleCount: number;
}

export interface GeneralStats {
  totalProducts: number;
  totalStock: number;
  categoriesCount: number;
  lowStockCount: number;
  lowStockSum: number;
  lowStockPercentage: number;
}
