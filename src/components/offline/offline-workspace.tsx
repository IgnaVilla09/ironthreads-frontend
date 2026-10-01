'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, CloudOff, Package, ShoppingBag, RefreshCw } from 'lucide-react';
import { offlineDb, offlineUser, type OfflineProduct, type PendingSale, type Snapshot } from '@/lib/offline-db';
import { useOfflineStore } from '@/stores/offline-store';
import { OfflineProvider } from './offline-provider';
import type { CreateSaleInput } from '@/types/venta';
import type { AuthUser } from '@/types/auth';
import { formatOfflineDateTime } from '@/lib/formatters';

type Tab = 'products' | 'sale' | 'pending';

export function OfflineWorkspace({ initialTab, embedded = false }: { initialTab?: Tab; embedded?: boolean }) {
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>(initialTab ?? (params.get('tab') === 'sale' || params.get('tab') === 'pending' ? params.get('tab') as Tab : 'products'));
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [sales, setSales] = useState<PendingSale[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<OfflineProduct | null>(null);
  const [variantId, setVariantId] = useState('');
  const [pointOfSaleId, setPointOfSaleId] = useState('');
  const [depositoId, setDepositoId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CreateSaleInput['items']>([]);
  const [draftUserId, setDraftUserId] = useState<string | null>(null);
  const [draftSelectedId, setDraftSelectedId] = useState<string | null>(null);
  const [draftStorageError, setDraftStorageError] = useState(false);
  const [unitPrice, setUnitPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<CreateSaleInput['paymentMethod']>('EFECTIVO');
  const [message, setMessage] = useState('');
  const offline = useOfflineStore((s) => s.offline);
  const syncing = useOfflineStore((s) => s.syncing);
  const prepared = useOfflineStore((s) => s.prepared);
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => setUser(offlineUser()), []);

  useEffect(() => {
    if (!user) return;
    try {
      const saved = JSON.parse(localStorage.getItem(`iron-offline-draft:${user.id}`) ?? 'null') as {
        version: number; cart: CreateSaleInput['items']; selectedId?: string; variantId?: string;
        pointOfSaleId: string; depositoId: string; quantity?: number; unitPrice?: number;
        paymentMethod: CreateSaleInput['paymentMethod'];
      } | null;
      if (saved?.version === 1 && Array.isArray(saved.cart)) {
        setCart(saved.cart);
        setPointOfSaleId(saved.pointOfSaleId ?? '');
        setDepositoId(saved.depositoId ?? '');
        setVariantId(saved.variantId ?? '');
        setDraftSelectedId(saved.selectedId ?? null);
        setQuantity(saved.quantity ?? 1);
        setUnitPrice(saved.unitPrice ?? 0);
        setPaymentMethod(saved.paymentMethod ?? 'EFECTIVO');
        if (saved.cart.length) setTab('sale');
      }
    } catch { setDraftStorageError(true); }
    setDraftUserId(user.id);
  }, [user?.id]);

  useEffect(() => {
    if (!draftSelectedId || !snapshot) return;
    setSelected(snapshot.products.find((product) => product.id === draftSelectedId) ?? null);
  }, [snapshot, draftSelectedId]);

  useEffect(() => {
    if (!user || draftUserId !== user.id) return;
    try {
      const key = `iron-offline-draft:${user.id}`;
      if (!cart.length && !selected?.id && !pointOfSaleId) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify({ version: 1, cart, selectedId: selected?.id ?? draftSelectedId,
        variantId, pointOfSaleId, depositoId, quantity, unitPrice, paymentMethod }));
      setDraftStorageError(false);
    } catch { setDraftStorageError(true); }
  }, [user?.id, draftUserId, cart, selected?.id, draftSelectedId, variantId, pointOfSaleId, depositoId, quantity, unitPrice, paymentMethod]);

  useEffect(() => {
    if (!(draftStorageError && cart.length) && !(offline && !prepared)) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [draftStorageError, cart.length, offline, prepared]);

  const reload = async () => {
    if (!user) return;
    const [saved, entries] = await Promise.all([offlineDb.snapshot(user.id), offlineDb.sales(user.id)]);
    setSnapshot(saved);
    setSales(entries);
    useOfflineStore.getState().setPending(entries.length);
  };
  useEffect(() => { void reload(); }, [user?.id, syncing]);
  useEffect(() => { if (!initialTab && params.get('tab')) setTab(params.get('tab') as Tab); }, [params, initialTab]);

  const filtered = useMemo(() => snapshot?.products.filter((p) =>
    `${p.name} ${p.category.label} ${p.variants.map((v) => v.sku).join(' ')}`.toLowerCase().includes(search.toLowerCase())) ?? [], [snapshot, search]);
  const variant = selected?.variants.find((v) => v.id === variantId);
  const locations = variant?.locations ?? [];
  const available = locations.find((row) => row.pointOfSaleId === pointOfSaleId && (row.depositoId ?? '') === depositoId)?.stock ?? 0;
  const queued = sales.filter((entry) => entry.status === 'pending').reduce((sum, entry) => sum + entry.sale.items
    .filter((item) => item.variantId === variantId && entry.sale.pointOfSaleId === pointOfSaleId && (entry.sale.depositoId ?? '') === depositoId)
    .reduce((count, item) => count + item.quantity, 0), 0) + cart.filter((item) => item.variantId === variantId).reduce((sum, item) => sum + item.quantity, 0);
  const remaining = Math.max(0, available - queued);

  const addToCart = () => {
    if (!variant || !pointOfSaleId || quantity < 1 || quantity > remaining || !Number.isInteger(unitPrice) || unitPrice < 0) return;
    setCart((items) => [...items, { variantId, quantity, unitPrice }]);
    setVariantId('');
    setQuantity(1);
    setMessage('Artículo agregado a la venta pendiente.');
  };

  const save = async () => {
    if (!user || !snapshot || !pointOfSaleId || !cart.length) return;
    const id = crypto.randomUUID();
    const entry: PendingSale = {
      id, userId: user.id, createdAt: new Date().toISOString(), status: 'pending',
      sale: { clientRequestId: id, pointOfSaleId, depositoId: depositoId || null,
        items: cart, paymentMethod },
    };
    try {
      await offlineDb.saveSale(entry);
      try { localStorage.removeItem(`iron-offline-draft:${user.id}`); } catch { /* The sale is already safely in IndexedDB. */ }
      await reload();
      setMessage('Venta guardada en este dispositivo. Pendiente de confirmación en el servidor.');
      setQuantity(1);
      setCart([]);
      setSelected(null);
      setDraftSelectedId(null);
      setVariantId('');
      setPointOfSaleId('');
      setDepositoId('');
    } catch { setMessage('No se pudo guardar la venta. Verificá el espacio disponible del dispositivo.'); }
  };

  const retry = async (entry: PendingSale) => {
    await offlineDb.saveSale({ ...entry, status: 'pending', reason: undefined });
    await reload();
    if (navigator.onLine) {
      const { syncPending } = await import('./offline-provider');
      await syncPending(entry.userId);
      await reload();
    }
  };

  const changeQuantity = async (entry: PendingSale) => {
    const items = [];
    for (const item of entry.sale.items) {
      const name = snapshot?.products.find((p) => p.variants.some((v) => v.id === item.variantId))?.name ?? 'Producto';
      const value = window.prompt(`Nueva cantidad de ${name}:`, String(item.quantity));
      if (value === null) return;
      const quantity = Number(value);
      if (!Number.isInteger(quantity) || quantity < 1) return;
      items.push({ ...item, quantity });
    }
    await offlineDb.saveSale({ ...entry, status: 'pending', reason: undefined,
      sale: { ...entry.sale, items } });
    await reload();
    if (navigator.onLine) {
      const { syncPending } = await import('./offline-provider');
      await syncPending(entry.userId);
      await reload();
    }
  };

  const discard = async (entry: PendingSale) => {
    if (!window.confirm('¿Descartar esta venta pendiente de este dispositivo? Esta acción no se puede deshacer.')) return;
    await offlineDb.deleteSale(entry.id);
    await reload();
  };

  return (
    <div className={`${embedded ? 'min-h-full' : 'min-h-dvh'} bg-[#f7f8f8] text-gray-900`}>
      {!embedded && <OfflineProvider />}
      {!embedded && <header className="border-b border-black/15 bg-black px-4 py-4 text-white sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><CloudOff className="h-5 w-5 text-amber-400" /><strong>Iron Stock</strong><span className="rounded-md bg-amber-400/20 px-2 py-1 text-sm text-amber-200">{offline ? 'Modo offline' : syncing ? 'Sincronizando…' : 'Datos locales'}</span></div>
          {!offline && <Link className="text-sm underline" href="/dashboard">Volver al panel</Link>}
        </div>
      </header>}
      <main id="contenido-principal" className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        {!user ? <div className="rounded-lg border bg-white p-6">Este dispositivo no tiene una sesión preparada para usar el modo offline. Conectate e iniciá sesión primero.</div> : <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <div><h1 className="text-2xl font-bold">Trabajo sin conexión</h1><p className="text-sm text-gray-600">{snapshot ? `Datos guardados: ${formatOfflineDateTime(snapshot.updatedAt)}` : 'Aún no hay datos offline preparados en este dispositivo.'}</p></div>
            <span className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">{sales.length} {sales.length === 1 ? 'venta pendiente' : 'ventas pendientes'}</span>
          </div>
          {offline && !prepared && <p role="alert" className="mb-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">No se confirmó que la página esté preparada para abrirse sin conexión. Evitá recargar hasta recuperar internet.</p>}
          {draftStorageError && <p role="alert" className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">No se pudo guardar el borrador de la venta. No recargues esta página hasta guardar la venta pendiente.</p>}
          <nav aria-label="Herramientas offline" className="mb-7 flex flex-wrap gap-2">
            {([['products', 'Productos', Package], ['sale', 'Venta nueva', ShoppingBag], ['pending', 'Sincronización', RefreshCw]] as const).map(([key, label, Icon]) =>
              <button key={key} type="button" onClick={() => { setTab(key); setMessage(''); }} className={`flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 ${tab === key ? 'bg-black text-white' : 'border bg-white text-gray-700 hover:bg-gray-100'}`}><Icon className="h-4 w-4" />{label}</button>)}
          </nav>
          {tab === 'products' && <section>
            <input aria-label="Buscar productos" placeholder="Buscar nombre, categoría o SKU" value={search} onChange={(event) => setSearch(event.target.value)} className="mb-4 w-full rounded-lg border bg-white px-4 py-3" />
            {selected ? <div className="rounded-xl border bg-white p-5"><button className="mb-4 flex items-center gap-2 text-sm underline" onClick={() => { setSelected(null); setDraftSelectedId(null); }}><ArrowLeft className="h-4 w-4" /> Volver a productos</button><h2 className="text-xl font-bold">{selected.name}</h2><p className="mb-4 text-sm text-gray-600">{selected.category.label} · {selected.description}</p>
              <div className="space-y-4">{selected.variants.map((v) => <div key={v.id} className="rounded-lg border p-4"><strong>{v.color.label} / {v.size.label}</strong><p className="text-xs text-gray-500">SKU: {v.sku}</p>{v.locations.length ? <ul className="mt-2 space-y-1 text-sm">{v.locations.map((location) => <li key={location.id}>{location.pointOfSale.label}{location.deposito ? ` / ${location.deposito.label}` : ''}: <strong>{location.stock}</strong> (último dato conocido)</li>)}</ul> : <p className="mt-2 text-sm text-gray-500">Sin ubicaciones asignadas</p>}</div>)}</div>
            </div> : <div className="space-y-2">{filtered.map((p) => <button key={p.id} onClick={() => { setSelected(p); setDraftSelectedId(p.id); }} className="flex w-full items-center justify-between rounded-lg border bg-white px-4 py-3 text-left hover:border-gray-400"><span><strong>{p.name}</strong><span className="block text-sm text-gray-500">{p.category.label} · {p.variants.length} variantes</span></span><span className="text-sm font-bold">{p.variants.reduce((sum, v) => sum + v.stock, 0)} u.</span></button>)}{!filtered.length && <p className="rounded-lg border bg-white p-6 text-sm text-gray-600">No hay productos guardados que coincidan.</p>}</div>}
          </section>}
          {tab === 'sale' && <section className="max-w-xl space-y-4 rounded-xl border bg-white p-5"><h2 className="text-xl font-bold">Venta nueva</h2><p className="text-sm text-amber-800"><AlertTriangle className="mr-1 inline h-4 w-4" />Se guardará como pendiente. El stock se confirmará al sincronizar.</p>
            <label className="block text-sm font-medium">Producto<select value={selected?.id ?? ''} onChange={(e) => { const product = snapshot?.products.find((p) => p.id === e.target.value) ?? null; setSelected(product); setDraftSelectedId(product?.id ?? null); setUnitPrice(product?.price ?? 0); setVariantId(''); }} className="mt-1 w-full rounded-md border p-3"><option value="">Seleccionar</option>{snapshot?.products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
            <label className="block text-sm font-medium">Variante<select value={variantId} onChange={(e) => { setVariantId(e.target.value); }} className="mt-1 w-full rounded-md border p-3"><option value="">Seleccionar</option>{selected?.variants.map((v) => <option key={v.id} value={v.id}>{v.color.label} / {v.size.label} · {v.sku}</option>)}</select></label>
            <label className="block text-sm font-medium">Ubicación<select disabled={cart.length > 0} value={`${pointOfSaleId}|${depositoId}`} onChange={(e) => { const [pos, dep] = e.target.value.split('|'); setPointOfSaleId(pos); setDepositoId(dep); }} className="mt-1 w-full rounded-md border p-3 disabled:bg-gray-100"><option value="|">Seleccionar</option>{locations.filter((l) => cart.length === 0 || l.pointOfSaleId === pointOfSaleId && (l.depositoId ?? '') === depositoId).map((l) => <option key={l.id} value={`${l.pointOfSaleId}|${l.depositoId ?? ''}`}>{l.pointOfSale.label}{l.deposito ? ` / ${l.deposito.label}` : ''} · {l.stock} u.</option>)}</select></label>
            {variantId && pointOfSaleId && <p className="text-sm text-gray-600">Último stock conocido: {available}. Pendiente en este dispositivo y carrito: {queued}. Restante estimado: <strong>{remaining}</strong>.</p>}
            <label className="block text-sm font-medium">Cantidad<input type="number" min="1" max={remaining} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="mt-1 w-full rounded-md border p-3" /></label>
            <label className="block text-sm font-medium">Precio unitario acordado<input type="number" min="0" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} className="mt-1 w-full rounded-md border p-3" /></label>
            <label className="block text-sm font-medium">Medio de pago<select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as CreateSaleInput['paymentMethod'])} className="mt-1 w-full rounded-md border p-3"><option value="EFECTIVO">Efectivo</option><option value="MERCADO_PAGO">Mercado Pago / transferencia</option><option value="OTRO">Otro</option></select></label>
            <button type="button" disabled={!variantId || !pointOfSaleId || !locations.some((row) => row.pointOfSaleId === pointOfSaleId && (row.depositoId ?? '') === depositoId) || remaining < quantity || quantity < 1 || unitPrice < 0} onClick={addToCart} className="min-h-11 w-full rounded-lg border border-black px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40">Agregar artículo</button>
            {cart.length > 0 && <div className="border-t pt-4"><h3 className="font-semibold">Artículos de la venta</h3><ul className="mt-2 space-y-2 text-sm">{cart.map((item, index) => <li key={`${item.variantId}-${index}`} className="flex items-center justify-between gap-3"><span>{snapshot?.products.find((p) => p.variants.some((v) => v.id === item.variantId))?.name ?? 'Producto'} · {item.quantity} × ${item.unitPrice}</span><button type="button" className="text-red-700 underline" onClick={() => setCart((items) => items.filter((_, position) => position !== index))}>Quitar</button></li>)}</ul></div>}
            <button type="button" disabled={!snapshot || !cart.length} onClick={() => void save()} className="min-h-11 w-full rounded-lg bg-black px-4 text-white disabled:cursor-not-allowed disabled:opacity-40">Guardar venta pendiente</button>{message && <p role="status" className="text-sm font-medium">{message}</p>}
          </section>}
          {tab === 'pending' && <section className="space-y-3"><h2 className="text-xl font-bold">Sincronización</h2>{sales.length ? sales.map((entry) => <div key={entry.id} className="rounded-xl border bg-white p-4"><div className="flex justify-between gap-3"><strong>{entry.status === 'review' ? 'Requiere revisión' : 'Pendiente de sincronización'}</strong><span className="text-sm text-gray-500">{formatOfflineDateTime(entry.createdAt)}</span></div><p className="mt-2 text-sm">{entry.sale.items.map((i) => `${snapshot?.products.find((p) => p.variants.some((v) => v.id === i.variantId))?.name ?? i.variantId} × ${i.quantity}`).join(', ')} · {entry.sale.paymentMethod}</p>{entry.reason && <p className="mt-2 text-sm text-red-700">{entry.reason}</p>}<div className="mt-3 flex flex-wrap gap-2">{entry.status === 'review' && <><button className="rounded-md border px-3 py-2 text-sm" onClick={() => void changeQuantity(entry)}>Ajustar cantidad</button>{!offline && <button className="rounded-md border px-3 py-2 text-sm" onClick={() => void retry(entry)}>Reintentar</button>}</>}<button className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700" onClick={() => void discard(entry)}>Descartar</button></div></div>) : <p className="rounded-lg border bg-white p-6 text-sm text-gray-600">No hay ventas pendientes en este dispositivo.</p>}</section>}
        </>}
      </main>
    </div>
  );
}
