'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Plus, Trash2, Pencil, Check, X, Save, ImagePlus } from 'lucide-react';
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
import { createProductSchema, CreateProductFormData } from '@/lib/validators';
import { generateSku } from '@/lib/sku-utils';
import { useProductStore } from '@/stores/product-store';
import { useSettingsStore } from '@/stores/settings-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { useToastStore } from '@/stores/toast-store';
import { Product, CreateVariantInput, InventoryAllocation, InventoryItem } from '@/types/product';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

interface ProductFormProps {
  initialData?: Product;
}

function emptyVariant(): CreateVariantInput {
  return { colorId: '', sizeId: '' };
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const {
    createProduct,
    updateProduct,
    createVariant,
    deleteVariant,
    isSubmitting,
  } = useProductStore();

  const { categories, colors, sizes, pointsOfSale, depositos, fetchAll, fetchPointsOfSale, fetchDepositos } = useSettingsStore();

  const addToast = useToastStore((s) => s.addToast);
  const {
    fetchInventoryByVariant,
    setVariantInventory,
  } = useInventoryStore();

  const [showVariantForm, setShowVariantForm] = useState(false);
  const [newVariant, setNewVariant] = useState<CreateVariantInput>(emptyVariant());
  const [posStocks, setPosStocks] = useState<Record<string, number>>({});
  const [posDepositos, setPosDepositos] = useState<Record<string, string>>({});
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editStocks, setEditStocks] = useState<Record<string, Record<string, number>>>({});
  const [editDepositos, setEditDepositos] = useState<Record<string, Record<string, string>>>({});
  const [variantInventory, setVariantInventoryState] = useState<Record<string, InventoryItem[]>>({});
  const [localVariantStocks, setLocalVariantStocks] = useState<Record<string, number>>(
    () => initialData?.variants.reduce((acc, v) => ({ ...acc, [v.id]: v.stock }), {}) ?? {}
  );

  useEffect(() => {
    fetchAll();
    fetchPointsOfSale();
  }, [fetchAll, fetchPointsOfSale]);

  const handlePosDepositoClick = (posId: string) => {
    const hasDepositos = depositos.some((d) => d.pointOfSaleId === posId);
    if (!hasDepositos) {
      fetchDepositos(posId);
    }
  };

  const buildInventoryAllocations = (): InventoryAllocation[] => {
    return Object.entries(posStocks)
      .filter(([_, stock]) => stock > 0)
      .map(([posId, stock]) => ({
        pointOfSaleId: posId,
        depositoId: posDepositos[posId] || undefined,
        stock,
      }));
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description ?? '',
          categoryId: initialData.categoryId,
          imageUrl: initialData.imageUrl ?? '',
          price: initialData.price ?? undefined,
        }
      : { name: '', description: '', categoryId: '', imageUrl: '' },
  });

  const name = watch('name');
  const imageUrl = watch('imageUrl');
  const price = watch('price');

  const previewSkuBase = name
    ? name.toUpperCase().trim().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '').slice(0, 10)
    : null;

  const selectedColor = colors.find((c) => c.id === newVariant.colorId);
  const selectedSize = sizes.find((s) => s.id === newVariant.sizeId);

  const handleUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      addToast('Faltan las variables de Supabase para subir imágenes', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      addToast('Seleccioná un archivo de imagen válido', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('La imagen no puede superar los 5 MB', 'error');
      return;
    }

    setIsUploadingImage(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const path = `products/${crypto.randomUUID()}-${safeName}`;
      const { error } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: false, cacheControl: '3600' });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      setValue('imageUrl', data.publicUrl, { shouldDirty: true, shouldValidate: true });
      addToast('Imagen subida correctamente', 'success');
    } catch {
      addToast('No se pudo subir la imagen', 'error');
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  const onSubmit = async (data: CreateProductFormData) => {
    const normalizedPrice = typeof data.price === 'number' && Number.isFinite(data.price)
      ? data.price
      : undefined;

    try {
      if (initialData) {
        await updateProduct(initialData.id, {
          name: data.name,
          description: data.description || undefined,
          categoryId: data.categoryId,
          imageUrl: data.imageUrl?.trim() || null,
          price: normalizedPrice ?? null,
        });
        addToast('Producto actualizado correctamente', 'success');
      } else {
        const product = await createProduct({
          name: data.name,
          description: data.description || undefined,
          categoryId: data.categoryId,
          imageUrl: data.imageUrl?.trim() || undefined,
          price: normalizedPrice,
        });
        if (newVariant.colorId && newVariant.sizeId) {
          const inventory = buildInventoryAllocations();
          await createVariant(product.id, {
            ...newVariant,
            inventory: inventory.length > 0 ? inventory : undefined,
          });
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
      const inventory = buildInventoryAllocations();
      await createVariant(initialData.id, { ...newVariant, inventory: inventory.length > 0 ? inventory : undefined });
      setNewVariant(emptyVariant());
      setPosStocks({});
      setPosDepositos({});
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

  const handleEditStock = async (variantId: string) => {
    if (editingVariant === variantId) {
      setEditingVariant(null);
      return;
    }

    let inventory: InventoryItem[] = variantInventory[variantId];
    if (!inventory) {
      inventory = await fetchInventoryByVariant(variantId);
      setVariantInventoryState((prev) => ({ ...prev, [variantId]: inventory }));
    }

    const stockMap: Record<string, number> = {};
    const depMap: Record<string, string> = {};
    inventory.forEach((inv) => {
      stockMap[inv.pointOfSaleId] = inv.stock;
      if (inv.depositoId) {
        depMap[inv.pointOfSaleId] = inv.depositoId;
      }
    });

    setEditStocks((prev) => ({ ...prev, [variantId]: stockMap }));
    setEditDepositos((prev) => ({ ...prev, [variantId]: depMap }));
    setEditingVariant(variantId);
  };

  const handleSaveStock = async (variantId: string) => {
    const stocks = editStocks[variantId] ?? {};
    const depos = editDepositos[variantId] ?? {};

    const items = pointsOfSale
      .filter((pos) => (stocks[pos.id] ?? 0) > 0)
      .map((pos) => ({
        pointOfSaleId: pos.id,
        depositoId: depos[pos.id] || null,
        stock: stocks[pos.id] ?? 0,
      }));

    try {
      await setVariantInventory(variantId, items);
      const newTotal = items.reduce((sum, item) => sum + item.stock, 0);
      setLocalVariantStocks((prev) => ({ ...prev, [variantId]: newTotal }));
      setEditingVariant(null);
      setVariantInventoryState((prev) => ({ ...prev, [variantId]: [] }));
      addToast('Stock actualizado correctamente', 'success');
    } catch {
      addToast('Error al actualizar stock', 'error');
    }
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Precio catálogo</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  placeholder="Ej: 25000"
                  {...register('price', {
                    setValueAs: (value) => value === '' ? undefined : Number(value),
                  })}
                />
                <p className="text-xs text-gray-500">
                  {typeof price === 'number' && !Number.isNaN(price)
                    ? formatCurrency(price)
                    : 'Este precio solo se usa en el catálogo web.'}
                </p>
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Imagen del catálogo</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://..."
                  {...register('imageUrl')}
                />
                {errors.imageUrl && (
                  <p className="text-sm text-red-500">{errors.imageUrl.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-dashed p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">Imagen del catálogo</p>
                  <p className="text-xs text-gray-500">
                    Se sube al bucket público `product-images` de Supabase Storage.
                  </p>
                </div>
                <Label
                  htmlFor="product-image-file"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
                >
                  {isUploadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                  {isUploadingImage ? 'Subiendo...' : 'Subir imagen'}
                </Label>
                <input
                  id="product-image-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadImage}
                  disabled={isUploadingImage}
                />
              </div>

              {imageUrl ? (
                <div className="relative h-48 w-full overflow-hidden rounded-xl border bg-gray-50 sm:w-48">
                  <Image src={imageUrl} alt={name || 'Vista previa'} fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-xl border bg-gray-50 text-sm text-gray-500">
                  Sin imagen cargada
                </div>
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
                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>

                {selectedColor && selectedSize && previewSkuBase && (
                  <p className="font-mono text-xs text-primary">
                    SKU: {generateSku(initialData.name, selectedColor.name, selectedSize.name)}
                  </p>
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Stock por punto de venta</Label>
                  <div className="rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Punto de Venta</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Depósito</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 w-24">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {pointsOfSale.map((pos) => {
                          const depositosDePos = depositos.filter((d) => d.pointOfSaleId === pos.id);
                          return (
                            <tr key={pos.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-sm font-medium">{pos.label}</td>
                              <td className="px-3 py-2">
                                <select
                                  className="h-8 w-full rounded border border-input bg-background px-2 text-xs"
                                  value={posDepositos[pos.id] ?? ''}
                                  onClick={() => handlePosDepositoClick(pos.id)}
                                  onChange={(e) =>
                                    setPosDepositos((prev) => ({
                                      ...prev,
                                      [pos.id]: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="">Sin depósito</option>
                                  {depositosDePos.map((dep) => (
                                    <option key={dep.id} value={dep.id}>{dep.label}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  min={0}
                                  className="h-8 text-right"
                                  value={posStocks[pos.id] ?? 0}
                                  onChange={(e) =>
                                    setPosStocks((prev) => ({
                                      ...prev,
                                      [pos.id]: Math.max(0, parseInt(e.target.value) || 0),
                                    }))
                                  }
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end">
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
            )}

            <div className="space-y-2">
              {initialData.variants.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Este producto no tiene variantes aún.
                </p>
              ) : (
                initialData.variants.map((variant) => {
                  const isEditing = editingVariant === variant.id;
                  const currentStocks = editStocks[variant.id] ?? {};
                  const currentDepos = editDepositos[variant.id] ?? {};

                  return (
                    <div key={variant.id}>
                      <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                        <div className="flex items-center gap-4 min-w-0">
                          <Badge variant="secondary" className="font-mono shrink-0">
                            {variant.sku}
                          </Badge>
                          <span className="text-sm text-gray-600 truncate">
                            {variant.color.label} — {variant.size.label}
                          </span>
                          <Badge variant="outline" className="shrink-0">
                            Stock: {localVariantStocks[variant.id] ?? variant.stock}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditStock(variant.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => handleDeleteVariant(variant.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="rounded-lg border border-t-0 bg-gray-50 p-4 space-y-3">
                          <p className="text-xs font-semibold text-gray-600">Stock por punto de venta</p>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500">Punto de Venta</th>
                                <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500">Depósito</th>
                                <th className="px-3 py-1.5 text-right text-xs font-medium text-gray-500 w-24">Stock</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {pointsOfSale.map((pos) => {
                                const deposDePos = depositos.filter((d) => d.pointOfSaleId === pos.id);
                                return (
                                  <tr key={pos.id} className="hover:bg-gray-100">
                                    <td className="px-3 py-1.5 text-sm font-medium">{pos.label}</td>
                                    <td className="px-3 py-1.5">
                                      <select
                                        className="h-7 w-full rounded border border-input bg-white px-2 text-xs"
                                        value={currentDepos[pos.id] ?? ''}
                                        onClick={() => handlePosDepositoClick(pos.id)}
                                        onChange={(e) =>
                                          setEditDepositos((prev) => ({
                                            ...prev,
                                            [variant.id]: {
                                              ...(prev[variant.id] ?? {}),
                                              [pos.id]: e.target.value,
                                            },
                                          }))
                                        }
                                      >
                                        <option value="">Sin depósito</option>
                                        {deposDePos.map((dep) => (
                                          <option key={dep.id} value={dep.id}>{dep.label}</option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="px-3 py-1.5">
                                      <Input
                                        type="number"
                                        min={0}
                                        className="h-7 text-right bg-white"
                                        value={currentStocks[pos.id] ?? 0}
                                        onChange={(e) =>
                                          setEditStocks((prev) => ({
                                            ...prev,
                                            [variant.id]: {
                                              ...(prev[variant.id] ?? {}),
                                              [pos.id]: Math.max(0, parseInt(e.target.value) || 0),
                                            },
                                          }))
                                        }
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingVariant(null)}>
                              Cancelar
                            </Button>
                            <Button size="sm" onClick={() => handleSaveStock(variant.id)}>
                              <Save className="h-3.5 w-3.5 mr-1" />
                              Guardar Stock
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
