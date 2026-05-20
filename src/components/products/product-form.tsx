'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StockBadge } from '@/components/shared/stock-badge';
import { createProductSchema, CreateProductFormData } from '@/lib/validators';
import { generateSku } from '@/lib/sku-utils';
import { useProductStore } from '@/stores/product-store';
import { useSettingsStore } from '@/stores/settings-store';
import { useToastStore } from '@/stores/toast-store';
import { Product, CreateVariantInput } from '@/types/product';
import { formatDate } from '@/lib/formatters';

interface ProductFormProps {
  initialData?: Product;
}

function emptyVariant(): CreateVariantInput {
  return { colorId: '', sizeId: '', stock: 0 };
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const {
    createProduct,
    updateProduct,
    createVariant,
    updateVariant,
    deleteVariant,
    isSubmitting,
  } = useProductStore();

  const { categories, colors, sizes, fetchAll } = useSettingsStore();

  const addToast = useToastStore((s) => s.addToast);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [newVariant, setNewVariant] = useState<CreateVariantInput>(emptyVariant());
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState(0);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description ?? '',
          categoryId: initialData.categoryId,
        }
      : { name: '', description: '', categoryId: '' },
  });

  const name = watch('name');
  const previewSkuBase = name
    ? name.toUpperCase().trim().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '').slice(0, 10)
    : null;

  const selectedColor = colors.find((c) => c.id === newVariant.colorId);
  const selectedSize = sizes.find((s) => s.id === newVariant.sizeId);

  const onSubmit = async (data: CreateProductFormData) => {
    try {
      if (initialData) {
        await updateProduct(initialData.id, {
          name: data.name,
          description: data.description || undefined,
          categoryId: data.categoryId,
        });
        addToast('Producto actualizado correctamente', 'success');
      } else {
        const product = await createProduct({
          name: data.name,
          description: data.description || undefined,
          categoryId: data.categoryId,
        });
        if (newVariant.colorId && newVariant.sizeId) {
          await createVariant(product.id, newVariant);
          addToast('Producto y variante creados correctamente', 'success');
        } else {
          addToast('Producto creado correctamente', 'success');
        }
      }
      router.push('/productos');
      router.refresh();
    } catch {
      addToast('Error al guardar el producto', 'error');
    }
  };

  const handleAddVariant = async () => {
    if (!initialData || !newVariant.colorId || !newVariant.sizeId) return;
    try {
      await createVariant(initialData.id, newVariant);
      setNewVariant(emptyVariant());
      addToast('Variante agregada correctamente', 'success');
    } catch {
      addToast('Error al agregar la variante', 'error');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta variante?')) return;
    try {
      await deleteVariant(initialData!.id, variantId);
      addToast('Variante eliminada correctamente', 'success');
    } catch {
      addToast('Error al eliminar la variante', 'error');
    }
  };

  const handleEditStock = (variantId: string, currentStock: number) => {
    setEditingStockId(variantId);
    setEditingStockValue(currentStock);
  };

  const handleSaveStock = async (variantId: string) => {
    try {
      await updateVariant(variantId, { stock: editingStockValue });
      setEditingStockId(null);
      addToast('Stock actualizado correctamente', 'success');
    } catch {
      addToast('Error al actualizar el stock', 'error');
    }
  };

  const handleCancelEditStock = () => {
    setEditingStockId(null);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del producto</Label>
              <Input
                id="name"
                placeholder="Ej: REMERA CLASSIC"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input
                id="description"
                placeholder="Breve descripción del producto"
                {...register('description')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <select
                id="category"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                {...register('categoryId')}
              >
                <option value="">Seleccionar...</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat.name} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-sm text-red-500">{errors.categoryId.message}</p>
              )}
            </div>

            {previewSkuBase && (
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                <p className="text-xs text-gray-500 mb-1">Prefijo SKU:</p>
                <p className="font-mono text-sm font-semibold text-primary">
                  {previewSkuBase}-[COLOR]-[TALLE]
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {initialData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Variantes</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => setShowVariantForm(!showVariantForm)}
                    >
                      {showVariantForm ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {showVariantForm ? 'Cerrar Variantes' : 'Agregar variante'}
                    </Button>
          </CardHeader>
          <CardContent>
            {showVariantForm && (
              <div className="mb-6 rounded-lg border p-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Color</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                      value={newVariant.colorId}
                      onChange={(e) =>
                        setNewVariant({ ...newVariant, colorId: e.target.value })
                      }
                    >
                      <option value="">Seleccionar</option>
                      {colors.map((col) => (
                        <option key={col.id || col.name} value={col.id}>
                          {col.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Talle</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                      value={newVariant.sizeId}
                      onChange={(e) =>
                        setNewVariant({ ...newVariant, sizeId: e.target.value })
                      }
                    >
                      <option value="">Seleccionar</option>
                      {sizes.map((sz) => (
                        <option key={sz.id || sz.name} value={sz.id}>
                          {sz.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Stock</Label>
                    <Input
                      type="number"
                      min={0}
                      value={newVariant.stock}
                      onChange={(e) =>
                        setNewVariant({
                          ...newVariant,
                          stock: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      size="sm"
                      onClick={handleAddVariant}
                      disabled={!newVariant.colorId || !newVariant.sizeId || isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                      {!isSubmitting && <Check className="h-4 w-4 mr-1" />}
                      CONFIRMAR
                    </Button>
                  </div>
                </div>

                {selectedColor && selectedSize && previewSkuBase && (
                  <p className="font-mono text-xs text-primary">
                    SKU: {generateSku(initialData.name, selectedColor.name, selectedSize.name)}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              {initialData.variants.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Este producto no tiene variantes aún.
                </p>
              ) : (
                initialData.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <Badge variant="secondary" className="font-mono shrink-0">
                        {variant.sku}
                      </Badge>
                      <span className="text-sm text-gray-600 truncate">
                        {variant.color.label} — {variant.size.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">Stock</span>
                        {editingStockId === variant.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min={0}
                              className="h-8 w-20 text-right font-bold text-base"
                              value={editingStockValue}
                              onChange={(e) =>
                                setEditingStockValue(parseInt(e.target.value) || 0)
                              }
                              autoFocus
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-green-600"
                              onClick={() => handleSaveStock(variant.id)}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={handleCancelEditStock}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 justify-end">
                            <span
                              className={`text-lg font-bold ${
                                variant.stock === 0
                                  ? 'text-red-600'
                                  :                                   variant.stock < 3
                                  ? 'text-amber-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {variant.stock}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                handleEditStock(variant.id, variant.stock)
                              }
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="hidden sm:block">
                        <StockBadge stock={variant.stock} />
                      </div>
                      <span className="hidden md:block text-xs text-gray-400">
                        {formatDate(variant.updatedAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 shrink-0"
                        onClick={() => handleDeleteVariant(variant.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
