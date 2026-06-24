'use client';

import { useState, useEffect, useRef } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToastStore } from '@/stores/toast-store';
import { useSettingsStore } from '@/stores/settings-store';
import { apiClient } from '@/lib/api-client';
import { Product } from '@/types/product';
import { ColorOption, SizeOption } from '@/types/settings';
import { StockVerificationItem } from '@/types/venta';
import { Search, ShoppingCart, Check, AlertTriangle, Minus, Plus, Package, Trash2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type PaymentMethod = 'EFECTIVO' | 'MERCADO_PAGO' | 'OTRO';

interface CartItem {
  variantId: string;
  productName: string;
  colorName: string;
  sizeName: string;
  colorLabel: string;
  sizeLabel: string;
  quantity: number;
  stock: number;
}

export default function VentasPage() {
  const addToast = useToastStore((s) => s.addToast);
  const { colors, sizes, pointsOfSale, fetchAll } = useSettingsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<StockVerificationItem | null>(null);

  const [selectedPos, setSelectedPos] = useState('');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [observaciones, setObservaciones] = useState('');

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingProducts(true);
      try {
        const res = await apiClient.get<Product[]>('/api/v1/products', {
          search: searchQuery,
          limit: 10,
        });
        setProducts(res.data ?? []);
        setShowDropdown(true);
      } catch {
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedColor('');
    setSelectedSize('');
    setQuantity(1);
    setVerificationResult(null);
    setSearchQuery(product.name);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setSelectedProduct(null);
    setSelectedColor('');
    setSelectedSize('');
    setQuantity(1);
    setSearchQuery('');
    setVerificationResult(null);
  };

  const availableColors: ColorOption[] = selectedProduct
    ? colors.filter((c) =>
        selectedProduct.variants.some((v) => v.colorId === c.id)
      )
    : [];

  const availableSizes: SizeOption[] = selectedProduct
    ? sizes.filter((s) =>
        selectedProduct.variants.some(
          (v) => v.sizeId === s.id && v.colorId === selectedColor
        )
      )
    : [];

  const selectedVariant = selectedProduct
    ? selectedProduct.variants.find(
        (v) => v.colorId === selectedColor && v.sizeId === selectedSize
      ) ?? null
    : null;

  const hasAllSelections = selectedProduct && selectedColor && selectedSize && quantity > 0;
  const canSubmit = cart.length > 0 && paymentMethod && selectedPos;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleVerifyStock = async () => {
    if (!selectedVariant) return;
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const res = await apiClient.post<StockVerificationItem[]>('/api/v1/ventas/verify-stock', {
        items: [{ variantId: selectedVariant.id, quantity }],
        pointOfSaleId: selectedPos || undefined,
      });
      if (res.data && res.data.length > 0) {
        setVerificationResult(res.data[0]);
      }
    } catch {
      addToast('Error al verificar stock', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant || !selectedProduct) return;

    const colorLabel = colors.find((c) => c.id === selectedColor)?.label ?? '';
    const sizeLabel = sizes.find((s) => s.id === selectedSize)?.label ?? '';

    const existingIndex = cart.findIndex(
      (item) => item.variantId === selectedVariant.id
    );

    if (existingIndex >= 0) {
      const updated = [...cart];
      const newQty = updated[existingIndex].quantity + quantity;
      if (newQty > selectedVariant.stock) {
        addToast(`Stock insuficiente. Disponible: ${selectedVariant.stock}`, 'error');
        return;
      }
      updated[existingIndex].quantity = newQty;
      setCart(updated);
    } else {
      setCart([...cart, {
        variantId: selectedVariant.id,
        productName: selectedProduct.name,
        colorName: selectedVariant.colorId,
        sizeName: selectedVariant.sizeId,
        colorLabel,
        sizeLabel,
        quantity,
        stock: selectedVariant.stock,
      }]);
    }

    addToast(`${selectedProduct.name} (${colorLabel} / ${sizeLabel}) agregado al carrito`, 'success');
    clearSelection();
  };

  const handleRemoveFromCart = (variantId: string) => {
    setCart(cart.filter((item) => item.variantId !== variantId));
  };

  const handleCartQuantityChange = (variantId: string, delta: number) => {
    setCart(cart.map((item) => {
      if (item.variantId !== variantId) return item;
      const newQty = item.quantity + delta;
      if (newQty < 1) return item;
      if (newQty > item.stock) {
        addToast(`Stock insuficiente. Disponible: ${item.stock}`, 'error');
        return item;
      }
      return { ...item, quantity: newQty };
    }));
  };

  const handleSubmit = async () => {
    if (cart.length === 0 || !paymentMethod || !selectedPos) return;
    setIsSubmitting(true);
    try {
      await apiClient.post('/api/v1/ventas', {
        items: cart.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: 0,
        })),
        paymentMethod,
        pointOfSaleId: selectedPos,
        observaciones: observaciones.trim() || undefined,
      });
      addToast('Venta registrada correctamente', 'success');
      setCart([]);
      setPaymentMethod(null);
      setObservaciones('');
      clearSelection();
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Error al registrar la venta',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <PageContainer>
      <PageHeader
        title="Ventas"
        description="Agregá productos al carrito y confirmá la venta"
      >
        <Link href="/ventas/historial">
          <Button variant="outline" className="gap-2">
            Ver historial
          </Button>
        </Link>
      </PageHeader>

      <div className="mb-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <MapPin className="h-4 w-4" /> Punto de Venta
          </label>
          <Select
            value={selectedPos}
            onChange={(e) => setSelectedPos(e.target.value)}
            options={pointsOfSale.map((p) => ({ value: p.id, label: p.label }))}
            placeholder="Seleccionar punto de venta"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-5">
              <h2 className="text-lg font-semibold">1. Seleccionar producto</h2>

              <div ref={searchRef} className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar producto..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedProduct) clearSelection();
                  }}
                  className="pl-9"
                />
                {showDropdown && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg max-h-60 overflow-y-auto">
                    {isLoadingProducts ? (
                      <div className="p-3 text-sm text-gray-500">Buscando...</div>
                    ) : products.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">
                        No se encontraron productos
                      </div>
                    ) : (
                      products.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleSelectProduct(product)}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <Package className="h-4 w-4 text-gray-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                            {product.description && (
                              <p className="text-xs text-gray-400 truncate">{product.description}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              {product.category.label} · {product.variants.length} variante{product.variants.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {selectedProduct && (
                <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3">
                  <div>
                    <p className="font-semibold">{selectedProduct.name}</p>
                    <p className="text-sm text-gray-500">{selectedProduct.category.label}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    Cambiar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedProduct && (
            <Card>
              <CardContent className="p-6 space-y-5">
                <h2 className="text-lg font-semibold">2. Unidad y talle</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Unidad (color)</label>
                    <Select
                      value={selectedColor}
                      onChange={(e) => {
                        setSelectedColor(e.target.value);
                        setSelectedSize('');
                        setVerificationResult(null);
                      }}
                      options={availableColors.map((c) => ({
                        value: c.id,
                        label: c.label,
                      }))}
                      placeholder="Seleccionar color"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Talle</label>
                    <Select
                      value={selectedSize}
                      onChange={(e) => {
                        setSelectedSize(e.target.value);
                        setVerificationResult(null);
                      }}
                      options={availableSizes.map((s) => ({
                        value: s.id,
                        label: s.label,
                      }))}
                      placeholder={selectedColor ? 'Seleccionar talle' : 'Primero elige un color'}
                    />
                  </div>
                </div>

                {selectedVariant && (
                  <div className="rounded-lg border bg-gray-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Stock disponible:</span>
                      <span className={cn(
                        'text-lg font-bold',
                        selectedVariant.stock <= 0 ? 'text-red-600' :
                        selectedVariant.stock <= 3 ? 'text-amber-600' :
                        'text-green-600'
                      )}>
                        {selectedVariant.stock} unidades
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cantidad</label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center text-lg font-bold tabular-nums">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => handleQuantityChange(1)}
                          disabled={selectedVariant.stock > 0 && quantity >= selectedVariant.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVerifyStock}
                      disabled={isVerifying || !selectedPos}
                      className="gap-2 w-full"
                    >
                      {isVerifying ? (
                        'Verificando...'
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4" />
                          Verificar stock en ubicación seleccionada
                        </>
                      )}
                    </Button>

                    {verificationResult && (
                      <div className={cn(
                        'rounded-lg border p-3 text-sm',
                        verificationResult.sufficient
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : 'border-red-200 bg-red-50 text-red-700'
                      )}>
                        <div className="flex items-center gap-2 font-medium">
                          {verificationResult.sufficient ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                          {verificationResult.sufficient
                            ? 'Stock suficiente'
                            : 'Stock insuficiente'}
                        </div>
                        <p className="mt-1 text-xs">
                          Solicitado: {verificationResult.requested} · Disponible: {verificationResult.available}
                          {!verificationResult.sufficient && ` · Faltan ${verificationResult.requested - verificationResult.available} unidades`}
                        </p>
                      </div>
                    )}

                    {selectedVariant.stock > 0 && selectedPos && (
                      <Button
                        className="w-full gap-2"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Agregar al carrito
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(hasAllSelections || cart.length > 0) && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold">3. Método de pago</h2>

                <div className="grid grid-cols-3 gap-3">
                  {(['EFECTIVO', 'MERCADO_PAGO', 'OTRO'] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={cn(
                        'rounded-xl border-2 p-4 text-center font-semibold transition-all',
                        paymentMethod === method
                          ? method === 'EFECTIVO' ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                            : method === 'MERCADO_PAGO' ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm'
                            : 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      )}
                    >
                      <div className="text-2xl mb-1">
                        {method === 'EFECTIVO' ? '💵' : method === 'MERCADO_PAGO' ? '💳' : '🔄'}
                      </div>
                       {method === 'EFECTIVO' ? 'Efectivo' : method === 'MERCADO_PAGO' ? 'Mercado Pago/Transferencia' : 'Otro'}
                    </button>
                  ))}
                </div>

                {paymentMethod && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Observaciones</label>
                    <textarea
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Opcional — agregá una nota a la venta..."
                      className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      maxLength={500}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Carrito</h2>
                {cart.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {cartTotalItems} item{cartTotalItems !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-sm text-gray-500 space-y-2">
                  <p>Seleccioná un producto y agregalo al carrito.</p>
                  <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
                    <ShoppingCart className="mx-auto h-8 w-8 text-gray-300" />
                    <p className="mt-2 text-xs text-gray-400">Carrito vacío</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.variantId} className="rounded-lg border bg-gray-50 p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                          <p className="text-xs text-gray-500">
                            {item.colorLabel} / {item.sizeLabel}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.variantId)}
                          className="shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleCartQuantityChange(item.variantId, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleCartQuantityChange(item.variantId, 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className={cn(
                          'text-xs',
                          item.stock <= 3 ? 'text-amber-600' : 'text-gray-500'
                        )}>
                          Stock: {item.stock}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-3 space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-600">Total items:</span>
                      <span className="text-gray-900">{cartTotalItems}</span>
                    </div>

                    {selectedPos && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ubicación:</span>
                        <span className="font-medium">
                          {pointsOfSale.find((p) => p.id === selectedPos)?.label}
                        </span>
                      </div>
                    )}

                    {paymentMethod && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Método de pago:</span>
                        <span className={cn(
                          'font-medium',
                          paymentMethod === 'EFECTIVO' ? 'text-green-600' :
                          paymentMethod === 'MERCADO_PAGO' ? 'text-sky-600' :
                          'text-orange-600'
                        )}>
                           {paymentMethod === 'EFECTIVO' ? 'Efectivo' :
                            paymentMethod === 'MERCADO_PAGO' ? 'Mercado Pago/Transferencia' :
                            'Otro'}
                        </span>
                      </div>
                    )}

                    <Button
                      className="w-full gap-2"
                      size="lg"
                      disabled={!canSubmit || isSubmitting}
                      onClick={handleSubmit}
                    >
                      {isSubmitting ? (
                        'Registrando...'
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Confirmar venta
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
