'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { StockBadge } from '@/components/shared/stock-badge';
import { useProductStore } from '@/stores/product-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Package, Layers } from 'lucide-react';

export default function ProductoPage() {
  const params = useParams();
  const id = params.id as string;
  const { selectedProduct, isLoading, isError, fetchProduct, resetSelectedProduct } = useProductStore();

  useEffect(() => {
    fetchProduct(id);
    return () => resetSelectedProduct();
  }, [id]);

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Cargando..." />
        <div className="max-w-2xl">
          <LoadingState count={5} type="form" />
        </div>
      </PageContainer>
    );
  }

  if (isError || !selectedProduct) {
    return (
      <PageContainer>
        <ErrorState message="No se pudo cargar el producto." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={selectedProduct.name}
        description={`${selectedProduct.category.label} — ${selectedProduct.variants.length} variante${selectedProduct.variants.length !== 1 ? 's' : ''}`}
      >
        <Link href={`/productos/${selectedProduct.id}/editar`}>
          <Button variant="outline" className="gap-2">
            <Pencil className="h-4 w-4" />
            Editar producto
          </Button>
        </Link>
      </PageHeader>

      {selectedProduct.description && (
        <div className="mb-6 max-w-2xl">
          <p className="text-sm text-gray-600">{selectedProduct.description}</p>
        </div>
      )}

      <div className="max-w-2xl">
        {selectedProduct.variants.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Este producto no tiene variantes.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2 rounded-xl border bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <Layers className="h-4 w-4" />
              <span className="font-medium">Stock total del producto:</span>
              <span className="font-bold">{selectedProduct.variants.reduce((sum, v) => sum + v.stock, 0)} unidades</span>
            </div>

            <div className="rounded-xl border bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Talle
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {selectedProduct.variants.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <Badge variant="secondary" className="font-mono">
                        {v.sku}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-sm">{v.color.label}</td>
                    <td className="px-6 py-3 text-sm">{v.size.label}</td>
                    <td className="px-6 py-3 text-right">
                      <span
                        className={`text-lg font-bold ${
                          v.stock === 0
                            ? 'text-red-600'
                            : v.stock < 3
                            ? 'text-amber-600'
                            : 'text-green-600'
                        }`}
                      >
                        {v.stock}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <StockBadge stock={v.stock} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
