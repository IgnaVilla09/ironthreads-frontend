'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useProductStore } from '@/stores/product-store';
import { useSettingsStore } from '@/stores/settings-store';
import { RotateCcw } from 'lucide-react';

export function ProductFilters() {
  const { filters, setFilters, clearFilters } = useProductStore();
  const { categories, pointsOfSale, depositos, fetchCategories, fetchPointsOfSale, fetchDepositos } = useSettingsStore();

  useEffect(() => {
    fetchCategories();
    fetchPointsOfSale();
  }, [fetchCategories, fetchPointsOfSale]);

  useEffect(() => {
    if (filters.pointOfSaleId) {
      fetchDepositos(filters.pointOfSaleId);
    }
  }, [filters.pointOfSaleId, fetchDepositos]);

  const filteredDepositos = depositos.filter(
    (d) => d.pointOfSaleId === filters.pointOfSaleId
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
        value={filters.pointOfSaleId ?? ''}
        onChange={(e) => {
          setFilters({
            pointOfSaleId: e.target.value || undefined,
            depositoId: undefined,
          });
        }}
      >
        <option value="">Todos los puntos de venta</option>
        {pointsOfSale.map((pos) => (
          <option key={pos.id || pos.name} value={pos.id}>
            {pos.label}
          </option>
        ))}
      </select>

      <select
        className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
        value={filters.depositoId ?? ''}
        onChange={(e) =>
          setFilters({
            depositoId: e.target.value || undefined,
          })
        }
        disabled={!filters.pointOfSaleId}
      >
        <option value="">Todos los depósitos</option>
        {filteredDepositos.map((dep) => (
          <option key={dep.id} value={dep.id}>
            {dep.label}
          </option>
        ))}
      </select>

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

      {(filters.categoryId || filters.pointOfSaleId || filters.depositoId) && (
        <Button variant="ghost" size="sm" className="gap-1" onClick={clearFilters}>
          <RotateCcw className="h-3 w-3" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
