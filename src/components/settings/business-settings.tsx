'use client';

import { useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useToastStore } from '@/stores/toast-store';
import type { Product } from '@/types/product';

type DiscountCode = {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usesCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string | null;
};

type CouponForm = {
  code: string;
  type: DiscountCode['type'];
  value: string;
  minOrderAmount: string;
  maxUses: string;
  validUntil: string;
};

const emptyCoupon = (): CouponForm => ({ code: '', type: 'PERCENTAGE', value: '', minOrderAmount: '', maxUses: '', validUntil: '' });

export function BusinessSettings() {
  const addToast = useToastStore((state) => state.addToast);
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyCoupon());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteCode, setDeleteCode] = useState<DiscountCode | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [codesResponse, productsResponse] = await Promise.all([
        apiClient.get<DiscountCode[]>('/api/v1/settings/discount-codes'),
        apiClient.get<Product[]>('/api/v1/products', { page: 1, limit: 100 }),
      ]);
      setCodes(codesResponse.data ?? []);
      setProducts(productsResponse.data ?? []);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'No se pudo cargar la configuración del negocio', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  async function saveCoupon(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const payload = {
      code: form.code,
      type: form.type,
      value: Number(form.value),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      validUntil: form.validUntil ? new Date(`${form.validUntil}T23:59:59`).toISOString() : null,
    };
    try {
      if (editingId) {
        await apiClient.put(`/api/v1/settings/discount-codes/${editingId}`, payload);
        addToast('Código de descuento actualizado', 'success');
      } else {
        await apiClient.post('/api/v1/settings/discount-codes', payload);
        addToast('Código de descuento creado', 'success');
      }
      setForm(emptyCoupon());
      setEditingId(null);
      await load();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'No se pudo guardar el código', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function toggleOffer(product: Product) {
    try {
      const response = await apiClient.put<Product>(`/api/v1/products/${product.id}`, { isOnSale: !product.isOnSale });
      if (response.data) setProducts((items) => items.map((item) => item.id === product.id ? response.data! : item));
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'No se pudo actualizar la oferta', 'error');
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <section className="rounded-lg border bg-white p-5">
        <div className="mb-5"><h2 className="text-lg font-semibold">Códigos de descuentos</h2><p className="text-sm text-gray-500">El código se valida exactamente como lo escribís aquí, incluyendo mayúsculas y caracteres.</p></div>
        <form onSubmit={saveCoupon} className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1"><Label>Código</Label><Input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="EJ: IRON10" /></div>
          <div className="space-y-1"><Label>Tipo</Label><select className="h-9 w-full rounded-md border px-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}><option value="PERCENTAGE">Porcentaje</option><option value="FIXED">Monto fijo</option></select></div>
          <div className="space-y-1"><Label>{form.type === 'PERCENTAGE' ? 'Porcentaje' : 'Monto (ARS)'}</Label><Input required min="1" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
          <div className="space-y-1"><Label>Compra mínima (opcional)</Label><Input min="0" type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} /></div>
          <div className="space-y-1"><Label>Máximo de usos (opcional)</Label><Input min="1" type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} /></div>
          <div className="flex items-end gap-2"><Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingId ? 'Guardar código' : <><Plus className="mr-1 h-4 w-4" />Crear código</>}</Button>{editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(emptyCoupon()); }}>Cancelar</Button>}</div>
        </form>
        <div className="mt-6 overflow-x-auto rounded-lg border"><table className="w-full min-w-[620px] text-sm"><thead className="bg-gray-50 text-left text-xs text-gray-500"><tr><th className="px-4 py-3">Código</th><th className="px-4 py-3">Descuento</th><th className="px-4 py-3">Usos</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead><tbody className="divide-y">{codes.map((code) => <tr key={code.id}><td className="px-4 py-3 font-mono font-medium">{code.code}</td><td className="px-4 py-3">{code.type === 'PERCENTAGE' ? `${code.value}%` : `$${code.value.toLocaleString('es-AR')}`}</td><td className="px-4 py-3 text-gray-500">{code.usesCount}{code.maxUses != null ? ` / ${code.maxUses}` : ' / sin límite'}</td><td className="px-4 py-3 text-right"><Button variant="ghost" size="icon" aria-label={`Editar ${code.code}`} onClick={() => { setEditingId(code.id); setForm({ code: code.code, type: code.type, value: String(code.value), minOrderAmount: String(code.minOrderAmount ?? ''), maxUses: String(code.maxUses ?? ''), validUntil: code.validUntil?.slice(0, 10) ?? '' }); }}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label={`Eliminar ${code.code}`} className="text-red-500" onClick={() => setDeleteCode(code)}><Trash2 className="h-4 w-4" /></Button></td></tr>)}{codes.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Todavía no hay códigos de descuento.</td></tr>}</tbody></table></div>
      </section>
      <section className="rounded-lg border bg-white p-5"><div className="mb-5"><h2 className="text-lg font-semibold">Productos en oferta</h2><p className="text-sm text-gray-500">Activa la pegatina de oferta que se ve en el catálogo público.</p></div><div className="divide-y rounded-lg border">{products.map((product) => <div key={product.id} className="flex items-center justify-between gap-4 px-4 py-3"><span className="text-sm font-medium">{product.name}</span><button type="button" role="switch" aria-checked={product.isOnSale} onClick={() => void toggleOffer(product)} className={`relative h-6 w-11 rounded-full transition-colors ${product.isOnSale ? 'bg-emerald-600' : 'bg-gray-300'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${product.isOnSale ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>)}{products.length === 0 && <p className="px-4 py-8 text-center text-sm text-gray-500">No hay productos disponibles.</p>}</div></section>
      <ConfirmDialog open={!!deleteCode} onOpenChange={(open) => !open && setDeleteCode(null)} title="Eliminar código" description={`Eliminar ${deleteCode?.code ?? ''}. Esta acción no se puede deshacer.`} confirmLabel="Eliminar" variant="destructive" onConfirm={async () => { if (!deleteCode) return; await apiClient.delete(`/api/v1/settings/discount-codes/${deleteCode.id}`); setDeleteCode(null); await load(); addToast('Código eliminado', 'success'); }} />
    </div>
  );
}
