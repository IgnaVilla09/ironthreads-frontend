'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { StockBadge } from '@/components/shared/stock-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProductStore } from '@/stores/product-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { InventoryItem } from '@/types/product';
import { Pencil, Package, Layers, MapPin, ArrowLeftRight } from 'lucide-react';

export default function ProductoPage() {
  const params = useParams();
  const id = params.id as string;
  const { selectedProduct, isLoading, isError, fetchProduct, resetSelectedProduct } = useProductStore();
  const { fetchInventoryByVariant } = useInventoryStore();
  const [inventoryMap, setInventoryMap] = useState<Map<string, InventoryItem[]>>(new Map());

  useEffect(() => {
    fetchProduct(id);
    return () => resetSelectedProduct();
  }, [id]);

  useEffect(() => {
    if (!selectedProduct) return;
    const loadInventory = async () => {
      const map = new Map<string, InventoryItem[]>();
      for (const variant of selectedProduct.variants) {
        const items = await fetchInventoryByVariant(variant.id);
        map.set(variant.id, items);
      }
      setInventoryMap(map);
    };
    loadInventory();
  }, [selectedProduct]);

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

  const totalStock = selectedProduct.variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <PageContainer>
      <PageHeader
        title={selectedProduct.name}
        description={`${selectedProduct.category.label} — ${selectedProduct.variants.length} variante${selectedProduct.variants.length !== 1 ? 's' : ''}`}
      >
        <div className="flex gap-2">
          <Link href={`/productos/${selectedProduct.id}/editar`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Link href={`/transferencias?productId=${selectedProduct.id}`}>
            <Button variant="outline" className="gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              Transferir
            </Button>
          </Link>
        </div>
      </PageHeader>

      {selectedProduct.description && (
        <div className="mb-6 max-w-2xl">
          <p className="text-sm text-gray-600">{selectedProduct.description}</p>
        </div>
      )}

      <div className="max-w-3xl">
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
              <span className="font-bold">{totalStock} unidades</span>
            </div>

            <div className="rounded-xl border bg-white">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Talle</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Stock Total</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Stock por Ubicación</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedProduct.variants.map((v) => {
                    const invItems = inventoryMap.get(v.id) ?? [];
                    return (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3">
                          <Badge variant="secondary" className="font-mono">{v.sku}</Badge>
                        </td>
                        <td className="px-6 py-3 text-sm">{v.color.label}</td>
                        <td className="px-6 py-3 text-sm">{v.size.label}</td>
                        <td className="px-6 py-3 text-right">
                          <span className={`text-lg font-bold ${
                            v.stock === 0 ? 'text-red-600' : v.stock < 3 ? 'text-amber-600' : 'text-green-600'
                          }`}>
                            {v.stock}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          {invItems.length === 0 ? (
                            <span className="text-xs text-gray-400">Sin stock asignado</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {invItems.map((inv) => (
                                <Badge key={inv.id} variant="outline" className="text-xs gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {inv.pointOfSale.label}
                                  {inv.deposito && <span className="text-gray-400">/{inv.deposito.label}</span>}
                                  <span className={`font-bold ${
                                    inv.stock === 0 ? 'text-red-600' : inv.stock < 3 ? 'text-amber-600' : 'text-green-600'
                                  }`}>
                                    {inv.stock}
                                  </span>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          <StockBadge stock={v.stock} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
