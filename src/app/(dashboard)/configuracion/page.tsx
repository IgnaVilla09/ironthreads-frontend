'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { LoadingState } from '@/components/shared/loading-state';
import { useSettingsStore } from '@/stores/settings-store';
import { useToastStore } from '@/stores/toast-store';
import type {
  CategoryOption,
  ColorOption,
  SizeOption,
  PointOfSaleOption,
  DepositoOption,
} from '@/types/settings';

type Tab = 'colores' | 'talles' | 'categorias' | 'puntos-venta';

const tabs: { key: Tab; label: string }[] = [
  { key: 'puntos-venta', label: 'Puntos de Venta' },
  { key: 'colores', label: 'Colores' },
  { key: 'talles', label: 'Talles' },
  { key: 'categorias', label: 'Categorías' },
];

interface DialogState<T> {
  open: boolean;
  editItem: T | null;
}

function emptyCategory() {
  return { name: '', label: '' };
}

function emptyColor() {
  return { name: '', label: '', hex: '' };
}

function emptySize() {
  return { name: '', label: '' };
}

function ColorSwatch({ hex }: { hex: string | null }) {
  if (!hex) return <div className="h-5 w-5 rounded-full border bg-gray-100" />;
  return (
    <div
      className="h-5 w-5 rounded-full border"
      style={{ backgroundColor: hex }}
    />
  );
}

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<Tab>('puntos-venta');
  const addToast = useToastStore((s) => s.addToast);
  const {
    categories,
    colors,
    sizes,
    pointsOfSale,
    depositos,
    isLoading,
    isSubmitting,
    fetchAll,
    createCategory,
    updateCategory,
    deleteCategory,
    createColor,
    updateColor,
    deleteColor,
    createSize,
    updateSize,
    deleteSize,
    createPointOfSale,
    updatePointOfSale,
    deletePointOfSale,
    fetchDepositos,
    createDeposito,
    updateDeposito,
    deleteDeposito,
  } = useSettingsStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Category dialog
  const [catDialog, setCatDialog] = useState<DialogState<CategoryOption>>({
    open: false,
    editItem: null,
  });
  const [catForm, setCatForm] = useState(emptyCategory());
  const [catDelete, setCatDelete] = useState<CategoryOption | null>(null);

  // Color dialog
  const [colorDialog, setColorDialog] = useState<DialogState<ColorOption>>({
    open: false,
    editItem: null,
  });
  const [colorForm, setColorForm] = useState(emptyColor());
  const [colorDelete, setColorDelete] = useState<ColorOption | null>(null);

  // Size dialog
  const [sizeDialog, setSizeDialog] = useState<DialogState<SizeOption>>({
    open: false,
    editItem: null,
  });
  const [sizeForm, setSizeForm] = useState(emptySize());
  const [sizeDelete, setSizeDelete] = useState<SizeOption | null>(null);

  // Point of Sale dialog
  const [posDialog, setPosDialog] = useState<DialogState<PointOfSaleOption>>({
    open: false,
    editItem: null,
  });
  const [posForm, setPosForm] = useState({ name: '', label: '' });
  const [posDelete, setPosDelete] = useState<PointOfSaleOption | null>(null);

  // Deposito dialog
  const [selectedPosForDepositos, setSelectedPosForDepositos] = useState<PointOfSaleOption | null>(null);
  const [depDialog, setDepDialog] = useState<DialogState<DepositoOption>>({
    open: false,
    editItem: null,
  });
  const [depForm, setDepForm] = useState({ name: '', label: '' });
  const [depDelete, setDepDelete] = useState<DepositoOption | null>(null);

  function openCategoryDialog(item: CategoryOption | null) {
    setCatDialog({ open: true, editItem: item });
    setCatForm(item ? { name: item.name, label: item.label } : emptyCategory());
  }

  function openColorDialog(item: ColorOption | null) {
    setColorDialog({ open: true, editItem: item });
    setColorForm(
      item ? { name: item.name, label: item.label, hex: item.hex ?? '' } : emptyColor()
    );
  }

  function openSizeDialog(item: SizeOption | null) {
    setSizeDialog({ open: true, editItem: item });
    setSizeForm(item ? { name: item.name, label: item.label } : emptySize());
  }

  function openPosDialog(item: PointOfSaleOption | null) {
    setPosDialog({ open: true, editItem: item });
    setPosForm(item ? { name: item.name, label: item.label } : { name: '', label: '' });
  }

  async function handleCategorySubmit() {
    if (!catForm.name.trim() || !catForm.label.trim()) return;
    try {
      if (catDialog.editItem) {
        await updateCategory(catDialog.editItem.id, catForm);
        addToast('Categoría actualizada correctamente', 'success');
      } else {
        await createCategory(catForm);
        addToast('Categoría creada correctamente', 'success');
      }
      setCatDialog({ open: false, editItem: null });
    } catch {
      addToast('Error al guardar la categoría', 'error');
    }
  }

  async function handleColorSubmit() {
    if (!colorForm.name.trim() || !colorForm.label.trim()) return;
    try {
      const payload = {
        name: colorForm.name,
        label: colorForm.label,
        ...(colorForm.hex ? { hex: colorForm.hex } : {}),
      };
      if (colorDialog.editItem) {
        await updateColor(colorDialog.editItem.id, payload);
        addToast('Color actualizado correctamente', 'success');
      } else {
        await createColor(payload);
        addToast('Color creado correctamente', 'success');
      }
      setColorDialog({ open: false, editItem: null });
    } catch {
      addToast('Error al guardar el color', 'error');
    }
  }

  async function handleSizeSubmit() {
    if (!sizeForm.name.trim() || !sizeForm.label.trim()) return;
    try {
      if (sizeDialog.editItem) {
        await updateSize(sizeDialog.editItem.id, sizeForm);
        addToast('Talle actualizado correctamente', 'success');
      } else {
        await createSize(sizeForm);
        addToast('Talle creado correctamente', 'success');
      }
      setSizeDialog({ open: false, editItem: null });
    } catch {
      addToast('Error al guardar el talle', 'error');
    }
  }

  async function handleDeleteCategory() {
    if (!catDelete) return;
    try {
      await deleteCategory(catDelete.id);
      addToast('Categoría eliminada correctamente', 'success');
      setCatDelete(null);
    } catch {
      addToast('Error al eliminar la categoría', 'error');
    }
  }

  async function handleDeleteColor() {
    if (!colorDelete) return;
    try {
      await deleteColor(colorDelete.id);
      addToast('Color eliminado correctamente', 'success');
      setColorDelete(null);
    } catch {
      addToast('Error al eliminar el color', 'error');
    }
  }

  async function handlePosSubmit() {
    if (!posForm.name.trim() || !posForm.label.trim()) return;
    try {
      if (posDialog.editItem) {
        await updatePointOfSale(posDialog.editItem.id, posForm);
        addToast('Punto de venta actualizado correctamente', 'success');
      } else {
        await createPointOfSale(posForm);
        addToast('Punto de venta creado correctamente', 'success');
      }
      setPosDialog({ open: false, editItem: null });
    } catch {
      addToast('Error al guardar el punto de venta', 'error');
    }
  }

  async function handleDeletePos() {
    if (!posDelete) return;
    try {
      await deletePointOfSale(posDelete.id);
      addToast('Punto de venta eliminado correctamente', 'success');
      setPosDelete(null);
    } catch {
      addToast('Error al eliminar el punto de venta', 'error');
    }
  }

  async function handleDeleteSize() {
    if (!sizeDelete) return;
    try {
      await deleteSize(sizeDelete.id);
      addToast('Talle eliminado correctamente', 'success');
      setSizeDelete(null);
    } catch {
      addToast('Error al eliminar el talle', 'error');
    }
  }

  // Deposito handlers
  function openDepositoDialog(item: DepositoOption | null) {
    setDepDialog({ open: true, editItem: item });
    setDepForm(item ? { name: item.name, label: item.label } : { name: '', label: '' });
  }

  async function handleDepositoSubmit() {
    if (!depForm.name.trim() || !depForm.label.trim() || !selectedPosForDepositos) return;
    try {
      if (depDialog.editItem) {
        await updateDeposito(depDialog.editItem.id, depForm);
        addToast('Depósito actualizado correctamente', 'success');
      } else {
        await createDeposito(selectedPosForDepositos.id, depForm);
        addToast('Depósito creado correctamente', 'success');
      }
      await fetchDepositos(selectedPosForDepositos.id);
      setDepDialog({ open: false, editItem: null });
    } catch {
      addToast('Error al guardar el depósito', 'error');
    }
  }

  async function handleDeleteDeposito() {
    if (!depDelete) return;
    try {
      await deleteDeposito(depDelete.id);
      addToast('Depósito eliminado correctamente', 'success');
      if (selectedPosForDepositos) await fetchDepositos(selectedPosForDepositos.id);
      setDepDelete(null);
    } catch {
      addToast('Error al eliminar el depósito', 'error');
    }
  }

  async function openPosDepositos(pos: PointOfSaleOption) {
    setSelectedPosForDepositos(pos);
    await fetchDepositos(pos.id);
  }

  if (isLoading && categories.length === 0) {
    return (
      <PageContainer>
        <LoadingState />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Configuración"
        description="Administra colores, talles y categorías de productos"
      />

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Puntos de Venta Tab */}
      {activeTab === 'puntos-venta' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">{pointsOfSale.length} puntos de venta</p>
            <Button size="sm" onClick={() => openPosDialog(null)}>
              <Plus className="mr-1 h-4 w-4" />
              Agregar punto de venta
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Etiqueta</th>
                  <th className="px-4 py-3 font-medium">Depósitos</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pointsOfSale.map((pos) => {
                  const posDepositos = depositos.filter((d) => d.pointOfSaleId === pos.id);
                  return (
                    <tr key={pos.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs font-medium uppercase">
                        {pos.name}
                      </td>
                      <td className="px-4 py-3">{pos.label}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{posDepositos.length}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => openPosDepositos(pos)}
                          >
                            Administrar
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openPosDialog(pos)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => setPosDelete(pos)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pointsOfSale.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No hay puntos de venta todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Depositos Dialog */}
          <Dialog
            open={!!selectedPosForDepositos}
            onOpenChange={(open) => { if (!open) setSelectedPosForDepositos(null); }}
          >
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  Depósitos — {selectedPosForDepositos?.label}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {depositos.filter((d) => d.pointOfSaleId === selectedPosForDepositos?.id).length} depósitos
                  </p>
                  <Button size="sm" onClick={() => openDepositoDialog(null)}>
                    <Plus className="mr-1 h-4 w-4" />
                    Agregar depósito
                  </Button>
                </div>
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Nombre</th>
                        <th className="px-4 py-3 font-medium">Etiqueta</th>
                        <th className="px-4 py-3 text-right font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {depositos
                        .filter((d) => d.pointOfSaleId === selectedPosForDepositos?.id)
                        .map((dep) => (
                          <tr key={dep.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono text-xs font-medium uppercase">
                              {dep.name}
                            </td>
                            <td className="px-4 py-3">{dep.label}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openDepositoDialog(dep)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500"
                                  onClick={() => setDepDelete(dep)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {depositos.filter((d) => d.pointOfSaleId === selectedPosForDepositos?.id).length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                            No hay depósitos en este punto de venta.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Deposito Create/Edit Dialog */}
          <Dialog
            open={depDialog.open}
            onOpenChange={(open) => { if (!open) setDepDialog({ open: false, editItem: null }); }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {depDialog.editItem ? 'Editar depósito' : 'Agregar depósito'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="dep-name">Nombre</Label>
                  <Input
                    id="dep-name"
                    placeholder="Ej: CAJA 1"
                    value={depForm.name}
                    onChange={(e) => setDepForm({ ...depForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dep-label">Etiqueta</Label>
                  <Input
                    id="dep-label"
                    placeholder="Ej: Caja 1"
                    value={depForm.label}
                    onChange={(e) => setDepForm({ ...depForm, label: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDepDialog({ open: false, editItem: null })}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button onClick={handleDepositoSubmit} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {depDialog.editItem ? 'Guardar' : 'Crear'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Colores Tab */}
      {activeTab === 'colores' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">{colors.length} colores</p>
            <Button size="sm" onClick={() => openColorDialog(null)}>
              <Plus className="mr-1 h-4 w-4" />
              Agregar color
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Color</th>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Etiqueta</th>
                  <th className="px-4 py-3 font-medium">Hex</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {colors.map((color) => (
                  <tr key={color.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <ColorSwatch hex={color.hex} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-medium uppercase">
                      {color.name}
                    </td>
                    <td className="px-4 py-3">{color.label}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {color.hex ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openColorDialog(color)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => setColorDelete(color)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {colors.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No hay colores todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Talles Tab */}
      {activeTab === 'talles' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">{sizes.length} talles</p>
            <Button size="sm" onClick={() => openSizeDialog(null)}>
              <Plus className="mr-1 h-4 w-4" />
              Agregar talle
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Etiqueta</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sizes.map((size) => (
                  <tr key={size.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs font-medium uppercase">
                      {size.name}
                    </td>
                    <td className="px-4 py-3">{size.label}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openSizeDialog(size)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => setSizeDelete(size)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sizes.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      No hay talles todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categorías Tab */}
      {activeTab === 'categorias' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">{categories.length} categorías</p>
            <Button size="sm" onClick={() => openCategoryDialog(null)}>
              <Plus className="mr-1 h-4 w-4" />
              Agregar categoría
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Etiqueta</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((cat) => (
                  <tr key={cat.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs font-medium uppercase">
                      {cat.name}
                    </td>
                    <td className="px-4 py-3">{cat.label}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openCategoryDialog(cat)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => setCatDelete(cat)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      No hay categorías todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Dialog */}
      <Dialog
        open={catDialog.open}
        onOpenChange={(open) => {
          if (!open) setCatDialog({ open: false, editItem: null });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {catDialog.editItem ? 'Editar categoría' : 'Agregar categoría'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nombre</Label>
              <Input
                id="cat-name"
                placeholder="Ej: REMERA"
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-label">Etiqueta</Label>
              <Input
                id="cat-label"
                placeholder="Ej: Remera"
                value={catForm.label}
                onChange={(e) => setCatForm({ ...catForm, label: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCatDialog({ open: false, editItem: null })}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleCategorySubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {catDialog.editItem ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Color Dialog */}
      <Dialog
        open={colorDialog.open}
        onOpenChange={(open) => {
          if (!open) setColorDialog({ open: false, editItem: null });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {colorDialog.editItem ? 'Editar color' : 'Agregar color'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="color-name">Nombre</Label>
              <Input
                id="color-name"
                placeholder="Ej: NEGRO"
                value={colorForm.name}
                onChange={(e) => setColorForm({ ...colorForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color-label">Etiqueta</Label>
              <Input
                id="color-label"
                placeholder="Ej: Negro"
                value={colorForm.label}
                onChange={(e) => setColorForm({ ...colorForm, label: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color-hex">Color HEX (opcional)</Label>
              <div className="flex gap-3">
                <Input
                  id="color-hex"
                  placeholder="#000000"
                  value={colorForm.hex}
                  onChange={(e) => setColorForm({ ...colorForm, hex: e.target.value })}
                />
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border">
                  <ColorSwatch hex={colorForm.hex || null} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setColorDialog({ open: false, editItem: null })}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleColorSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {colorDialog.editItem ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Point of Sale Dialog */}
      <Dialog
        open={posDialog.open}
        onOpenChange={(open) => {
          if (!open) setPosDialog({ open: false, editItem: null });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {posDialog.editItem ? 'Editar punto de venta' : 'Agregar punto de venta'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="pos-name">Nombre</Label>
              <Input
                id="pos-name"
                placeholder="Ej: DEPARTAMENTO"
                value={posForm.name}
                onChange={(e) => setPosForm({ ...posForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pos-label">Etiqueta</Label>
              <Input
                id="pos-label"
                placeholder="Ej: Departamento"
                value={posForm.label}
                onChange={(e) => setPosForm({ ...posForm, label: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPosDialog({ open: false, editItem: null })}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handlePosSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {posDialog.editItem ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Size Dialog */}
      <Dialog
        open={sizeDialog.open}
        onOpenChange={(open) => {
          if (!open) setSizeDialog({ open: false, editItem: null });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {sizeDialog.editItem ? 'Editar talle' : 'Agregar talle'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="size-name">Nombre</Label>
              <Input
                id="size-name"
                placeholder="Ej: M"
                value={sizeForm.name}
                onChange={(e) => setSizeForm({ ...sizeForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size-label">Etiqueta</Label>
              <Input
                id="size-label"
                placeholder="Ej: M"
                value={sizeForm.label}
                onChange={(e) => setSizeForm({ ...sizeForm, label: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSizeDialog({ open: false, editItem: null })}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleSizeSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {sizeDialog.editItem ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmations */}
      <ConfirmDialog
        open={!!catDelete}
        onOpenChange={(open) => { if (!open) setCatDelete(null); }}
        title="Eliminar categoría"
        description={`¿Estás seguro de eliminar "${catDelete?.label}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleDeleteCategory}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        open={!!colorDelete}
        onOpenChange={(open) => { if (!open) setColorDelete(null); }}
        title="Eliminar color"
        description={`¿Estás seguro de eliminar "${colorDelete?.label}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleDeleteColor}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        open={!!posDelete}
        onOpenChange={(open) => { if (!open) setPosDelete(null); }}
        title="Eliminar punto de venta"
        description={`¿Estás seguro de eliminar "${posDelete?.label}"? También se eliminarán todos sus depósitos. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleDeletePos}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        open={!!depDelete}
        onOpenChange={(open) => { if (!open) setDepDelete(null); }}
        title="Eliminar depósito"
        description={`¿Estás seguro de eliminar "${depDelete?.label}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleDeleteDeposito}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        open={!!sizeDelete}
        onOpenChange={(open) => { if (!open) setSizeDelete(null); }}
        title="Eliminar talle"
        description={`¿Estás seguro de eliminar "${sizeDelete?.label}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleDeleteSize}
        isLoading={isSubmitting}
      />
    </PageContainer>
  );
}
