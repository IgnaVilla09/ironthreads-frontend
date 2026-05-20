export interface CategoryOption {
  id: string;
  name: string;
  label: string;
}

export interface ColorOption {
  id: string;
  name: string;
  label: string;
  hex: string | null;
}

export interface SizeOption {
  id: string;
  name: string;
  label: string;
}

export interface CreateCategoryInput {
  name: string;
  label: string;
}

export interface UpdateCategoryInput {
  name?: string;
  label?: string;
}

export interface CreateColorInput {
  name: string;
  label: string;
  hex?: string;
}

export interface UpdateColorInput {
  name?: string;
  label?: string;
  hex?: string;
}

export interface CreateSizeInput {
  name: string;
  label: string;
}

export interface UpdateSizeInput {
  name?: string;
  label?: string;
}
