'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, Layers, Package } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingState } from '@/components/shared/loading-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { LowStockProduct } from '@/types/analytics';

export default function StockBajoPage() {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        setIsError(false);

        const response = await apiClient.get<LowStockProduct[]>('/api/v1/analytics/low-stock');
        setProducts(response.data ?? []);
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    void loadProducts();
  }, []);

  if (isError) {
    return (
      <PageContainer>
        <PageHeader
          title="Stock bajo"
          description="Productos con stock total menor o igual a 5 unidades."
        />
        <ErrorState message="No se pudo cargar la lista de productos con stock bajo." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Stock bajo"
        description="Productos cuyo stock total, sumando todas sus variantes, es menor o igual a 5 unidades."
      />

      {isLoading ? (
        <LoadingState count={6} type="table" />
      ) : products.length === 0 ? (
        <EmptyState
          title="No hay productos con stock bajo"
          description="Todos los productos superan el umbral actual de 5 unidades totales."
        />
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <Link key={product.id} href={`/productos/${product.id}`} className="block">
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
                        <Badge variant="secondary">{product.category.label}</Badge>
                      </div>
                      {product.description ? (
                        <p className="max-w-2xl text-sm text-gray-600">{product.description}</p>
                      ) : null}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Layers className="h-4 w-4" />
                          {product.variantsCount} variante{product.variantsCount !== 1 ? 's' : ''}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Package className="h-4 w-4" />
                          {product.price !== null ? formatCurrency(product.price) : 'Sin precio'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Stock total</p>
                      <p className="text-3xl font-bold text-red-600">{formatNumber(product.totalStock)}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
