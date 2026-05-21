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
import { Plus, Package } from 'lucide-react';

export default function ProductosPage() {
  const { products, pagination, isLoading, isError, errorMessage, filters, searchQuery, fetchProducts } = useProductStore();
  const [page, setPage] = useState(1);
  const [totalStock, setTotalStock] = useState<number | null>(null);

  useEffect(() => {
    apiClient.get<GeneralStats>('/api/v1/analytics/general-stats')
      .then((res) => setTotalStock(res.data?.totalStock ?? null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchProducts(page);
  }, [filters, searchQuery, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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
        <Link href="/productos/nuevo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </Link>
      </PageHeader>

      {totalStock !== null && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <Package className="h-4 w-4" />
          <span className="font-medium">Valor total del inventario:</span>
          <span className="font-bold">{totalStock} unidades</span>
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
