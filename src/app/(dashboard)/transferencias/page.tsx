'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/loading-state';
import { useSettingsStore } from '@/stores/settings-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { apiClient } from '@/lib/api-client';
import { useToastStore } from '@/stores/toast-store';
import { Product, ProductVariant, StockTransfer } from '@/types/product';
import { ArrowLeftRight, Package, Search, Loader2, Check } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

export default function TransferenciasPage() {
  return (
    <Suspense fallback={<LoadingState count={5} type="table" />}>
      <TransferenciasContent />
    </Suspense>
  );
}

function TransferenciasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addToast = useToastStore((s) => s.addToast);

  const { pointsOfSale, depositos, fetchPointsOfSale, fetchDepositos } = useSettingsStore();
  const { createTransfer, transfers, transferPagination, isLoading, isSubmitting, fetchTransfers } = useInventoryStore();

  const [productSearch, setProductSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');

  const [fromPos, setFromPos] = useState('');
  const [fromDeposito, setFromDeposito] = useState('');
  const [toPos, setToPos] = useState('');
  const [toDeposito, setToDeposito] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [activeTab, setActiveTab] = useState<'transfer' | 'history'>('transfer');

  useEffect(() => {
    fetchPointsOfSale();
    fetchTransfers(1);
  }, []);

  useEffect(() => {
    if (fromPos) fetchDepositos(fromPos);
  }, [fromPos, fetchDepositos]);

  useEffect(() => {
    if (toPos) fetchDepositos(toPos);
  }, [toPos, fetchDepositos]);

  const fromDepositos = depositos.filter((d) => d.pointOfSaleId === fromPos);
  const toDepositos = depositos.filter((d) => d.pointOfSaleId === toPos);

  // Auto-select from URL params
  const preloadedProductId = searchParams.get('productId');
  const preloadedVariantId = searchParams.get('variantId');

  useEffect(() => {
    if (preloadedProductId) {
      apiClient.get<Product>(`/api/v1/products/${preloadedProductId}`).then((res) => {
        if (res.data) {
          setSelectedProduct(res.data);
          setProductSearch(res.data.name);
        }
      });
    }
  }, [preloadedProductId]);

  useEffect(() => {
    if (!selectedProduct) return;
    if (preloadedVariantId && selectedProduct.variants.some((v) => v.id === preloadedVariantId)) {
      setSelectedVariant(preloadedVariantId);
    }
  }, [selectedProduct, preloadedVariantId]);

  const handleProductSearch = async (q: string) => {
    setProductSearch(q);
    if (!q.trim()) {
      setProducts([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await apiClient.get<Product[]>('/api/v1/products', { search: q, limit: 10 });
      setProducts(res.data ?? []);
      setShowDropdown(true);
    } catch {
      setProducts([]);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedVariant('');
    setProductSearch(product.name);
    setShowDropdown(false);
  };

  const filteredVariants = selectedProduct?.variants ?? [];

  const handleSubmit = async () => {
    if (!selectedVariant || !fromPos || !toPos || quantity < 1) return;

    try {
      await createTransfer({
        variantId: selectedVariant,
        fromPointOfSaleId: fromPos,
        fromDepositoId: fromDeposito || undefined,
        toPointOfSaleId: toPos,
        toDepositoId: toDeposito || undefined,
        quantity,
      });
      addToast('Transferencia realizada correctamente', 'success');
      setQuantity(1);
      fetchTransfers(1);
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Error al transferir stock',
        'error'
      );
    }
  };

  const canTransfer = selectedVariant && fromPos && toPos && quantity > 0 && fromPos !== toPos;

  return (
    <PageContainer>
      <PageHeader
        title="Transferencias de Stock"
        description="Transferí stock entre puntos de venta o depósitos"
      />

      <div className="mb-4 flex gap-2">
        <Button
          variant={activeTab === 'transfer' ? 'default' : 'outline'}
          onClick={() => setActiveTab('transfer')}
          className="gap-2"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Nueva Transferencia
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'outline'}
          onClick={() => setActiveTab('history')}
          className="gap-2"
        >
          <Package className="h-4 w-4" />
          Historial
        </Button>
      </div>

      {activeTab === 'transfer' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Buscar producto</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar producto..."
                    value={productSearch}
                    onChange={(e) => handleProductSearch(e.target.value)}
                    className="pl-9"
                  />
                  {showDropdown && (
                    <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg max-h-60 overflow-y-auto">
                      {products.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleSelectProduct(product)}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                        >
                          <Package className="h-4 w-4 text-gray-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.category.label}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedProduct && (
                <div className="space-y-2">
                  <Label>Variante (color / talle)</Label>
                  <Select
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    options={filteredVariants.map((v) => ({
                      value: v.id,
                      label: `${v.color.label} / ${v.size.label} (SKU: ${v.sku})`,
                    }))}
                    placeholder="Seleccionar variante"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Origen y Destino</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-red-600">Origen</Label>
                <Select
                  value={fromPos}
                  onChange={(e) => { setFromPos(e.target.value); setFromDeposito(''); }}
                  options={pointsOfSale.map((p) => ({ value: p.id, label: p.label }))}
                  placeholder="Seleccionar punto de venta"
                />
                <Select
                  value={fromDeposito}
                  onChange={(e) => setFromDeposito(e.target.value)}
                  options={fromDepositos.map((d) => ({ value: d.id, label: d.label }))}
                  placeholder="Depósito (opcional)"
                  disabled={!fromPos}
                />
              </div>

              <div className="flex justify-center py-2">
                <ArrowLeftRight className="h-6 w-6 text-gray-400" />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-green-600">Destino</Label>
                <Select
                  value={toPos}
                  onChange={(e) => { setToPos(e.target.value); setToDeposito(''); }}
                  options={pointsOfSale.map((p) => ({ value: p.id, label: p.label }))}
                  placeholder="Seleccionar punto de venta"
                />
                <Select
                  value={toDeposito}
                  onChange={(e) => setToDeposito(e.target.value)}
                  options={toDepositos.map((d) => ({ value: d.id, label: d.label }))}
                  placeholder="Depósito (opcional)"
                  disabled={!toPos}
                />
              </div>

              {fromPos === toPos && fromPos && (
                <p className="text-xs text-amber-600">
                  El origen y destino son el mismo punto de venta. Seleccioná depósitos diferentes si es necesario.
                </p>
              )}

              <Button
                className="w-full gap-2"
                disabled={!canTransfer || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowLeftRight className="h-4 w-4" />
                )}
                {isSubmitting ? 'Transfiriendo...' : 'Transferir Stock'}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historial de Transferencias</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState count={5} type="table" />
            ) : transfers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No hay transferencias registradas</p>
            ) : (
              <div className="rounded-xl border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Producto</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Variante</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Origen</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Destino</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-right">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {transfers.map((t: StockTransfer) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(t.createdAt)}</td>
                        <td className="px-4 py-3 text-sm font-medium">{t.variant.product.name}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="font-mono text-xs">{t.variant.sku}</Badge>
                          <span className="text-xs text-gray-500 ml-2">
                            {t.variant.color.label} / {t.variant.size.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {t.fromPointOfSale.label}
                          {t.fromDeposito && <span className="text-gray-400"> / {t.fromDeposito.label}</span>}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {t.toPointOfSale.label}
                          {t.toDeposito && <span className="text-gray-400"> / {t.toDeposito.label}</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">+{t.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {transferPagination && transferPagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: transferPagination.totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={transferPagination.page === i + 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => fetchTransfers(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
