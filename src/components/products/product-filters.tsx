'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useProductStore } from '@/stores/product-store';
import { useSettingsStore } from '@/stores/settings-store';
import { RotateCcw } from 'lucide-react';

export function ProductFilters() {
  const { filters, setFilters, clearFilters } = useProductStore();
  const { categories, fetchCategories } = useSettingsStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
        value={filters.categoryId ?? ''}
        onChange={(e) =>
          setFilters({
            categoryId: e.target.value || undefined,
          })
        }
      >
        <option value="">Todas las categorías</option>
        {categories.map((cat) => (
          <option key={cat.id || cat.name} value={cat.id}>
            {cat.label}
          </option>
        ))}
      </select>

      {filters.categoryId && (
        <Button variant="ghost" size="sm" className="gap-1" onClick={clearFilters}>
          <RotateCcw className="h-3 w-3" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
