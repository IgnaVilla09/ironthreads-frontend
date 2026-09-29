'use client';

import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { ProductTable } from '@/components/products/product-table';
import { ProductSearch } from '@/components/products/product-search';
import { ProductFilters } from '@/components/products/product-filters';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { EmptyState } from '@/components/shared/empty-state';
import { Pagination } from '@/components/shared/pagination';
import { useProductStore } from '@/stores/product-store';
import { apiClient } from '@/lib/api-client';
import { GeneralStats } from '@/types/analytics';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Package, Download, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ProductosPage() {
  const { products, pagination, isLoading, isError, errorMessage, filters, searchQuery, fetchProducts } = useProductStore();
  const [pageSelection, setPageSelection] = useState({ key: '', page: 1 });
  const filterKey = JSON.stringify([filters.categoryId, filters.pointOfSaleId, filters.search, searchQuery]);
  const page = pageSelection.key === filterKey ? pageSelection.page : 1;
  const [totalStock, setTotalStock] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setPageSelection({ key: filterKey, page: 1 });
  }, [filterKey]);

  useEffect(() => {
    apiClient.get<GeneralStats>('/api/v1/analytics/general-stats')
      .then((res) => setTotalStock(res.data?.totalStock ?? null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts(page);
  }, [fetchProducts, filterKey, page]);

  const handlePageChange = (newPage: number) => {
    setPageSelection({ key: filterKey, page: newPage });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/inventory/export-by-pos`);
      if (!res.ok) throw new Error('Error al exportar');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventario-por-punto-de-venta-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Error al exportar el inventario por punto de venta');
    } finally {
      setIsExporting(false);
    }
  };

  if (isError) {
    return (
      <PageContainer>
        <ErrorState
          message={errorMessage ?? 'Error al cargar productos'}
          onRetry={() => fetchProducts(page)}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Productos"
        description="Gestiona tu inventario de productos"
      >
         <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
             {isExporting ? 'Exportando…' : 'Exportar inventario'}
          </Button>
          <Button asChild className="gap-2">
            <Link href="/productos/nuevo">
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Link>
          </Button>
        </div>
      </PageHeader>

      {totalStock !== null && (
        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-primary/25 bg-accent px-4 py-3 text-sm text-black">
          <Package className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="font-medium">Unidades en inventario</span>
          <span className="font-bold tabular-nums">{new Intl.NumberFormat('es-AR').format(totalStock)}</span>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ProductSearch />
        <ProductFilters />
      </div>

      {isLoading ? (
        <LoadingState count={8} type="table" />
      ) : products.length === 0 ? (
        <EmptyState
          title="No hay productos"
          description="No se encontraron productos con los filtros actuales."
          action={{ label: 'Crear producto', href: '/productos/nuevo' }}
        />
      ) : (
        <>
          <ProductTable products={products} pagination={pagination} onPageChange={handlePageChange} />
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </PageContainer>
  );
}
