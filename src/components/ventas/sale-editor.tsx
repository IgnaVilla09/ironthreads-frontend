'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { apiClient, ApiError } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { refreshAfterSaleEdit } from '@/lib/sale-refresh';
import type { Sale, SaleEdit, SaleEditInput } from '@/types/venta';
import type { Product, InventoryItem } from '@/types/product';
import type { DepositoOption } from '@/types/settings';
import { useOfflineStore } from '@/stores/offline-store';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ReturnDraft = { quantity: string; deposito: string; price: string };
type Delivery = SaleEditInput['deliveries'][number] & { label: string; deposito: string };
const selectClass = 'mt-1 w-full rounded-md border bg-white p-2 text-sm';
const integer = (value: string, min = 0) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) >= min && Number(value) <= 2147483647;

export function SaleEditor({ saleId }: { saleId: string }) {
  const [sale, setSale] = useState<Sale | null>(null);
  const [history, setHistory] = useState<SaleEdit[]>([]);
  const [depositos, setDepositos] = useState<DepositoOption[]>([]);
  const [returns, setReturns] = useState<Record<string, ReturnDraft>>({});
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [reason, setReason] = useState('');
  const [payment, setPayment] = useState('');
  const [settled, setSettled] = useState(false);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [variantId, setVariantId] = useState('');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryId, setInventoryId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [retry, setRetry] = useState<SaleEditInput | null>(null);
  const submitting = useRef(false);
  const offline = useOfflineStore((state) => state.offline);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [result, edits] = await Promise.all([
        apiClient.get<Sale>(`/api/v1/ventas/${saleId}`),
        apiClient.get<SaleEdit[]>(`/api/v1/ventas/${saleId}/edits`),
      ]);
      if (!result.data) throw new Error('Venta no encontrada');
      const current = result.data;
      const locations = current.pointOfSaleId
        ? await apiClient.get<DepositoOption[]>(`/api/v1/settings/points-of-sale/${current.pointOfSaleId}/depositos`)
        : { data: [] };
      setSale(current);
      setHistory(edits.data ?? []);
      setDepositos(locations.data ?? []);
      setReturns(Object.fromEntries(current.items.map((item) => [item.id, {
        quantity: '0', deposito: '', price: item.unitPrice === 0 ? '' : String(item.unitPrice),
      }])));
      setDeliveries([]); setReason(''); setPayment(''); setSettled(false);
      setProduct(null); setVariantId(''); setInventoryId(''); setSearch('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la venta');
    } finally { setLoading(false); }
  }, [saleId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    let active = true;
    setProducts([]);
    if (!search.trim() || !sale?.pointOfSaleId) return;
    const timer = setTimeout(() => {
      apiClient.get<Product[]>('/api/v1/products', { search: search.trim(), limit: 20 })
        .then((result) => { if (active) setProducts(result.data ?? []); })
        .catch(() => { if (active) setError('No se pudieron buscar productos'); });
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [search, sale?.pointOfSaleId]);

  useEffect(() => {
    let active = true;
    setInventory([]); setInventoryId('');
    if (!variantId) return;
    apiClient.get<InventoryItem[]>(`/api/v1/inventory/variants/${variantId}`)
      .then((result) => { if (active) setInventory((result.data ?? []).filter((item) => item.pointOfSaleId === sale?.pointOfSaleId)); })
      .catch(() => { if (active) setError('No se pudo consultar el stock por depósito'); });
    return () => { active = false; };
  }, [variantId, sale?.pointOfSaleId]);

  const selectedReturns = sale?.items.filter((item) => Number(returns[item.id]?.quantity) > 0) ?? [];
  const returnedValue = selectedReturns.reduce((sum, item) => sum + Number(returns[item.id].quantity) * Number(returns[item.id].price), 0);
  const regularization = selectedReturns.reduce((sum, item) => sum + (Number(returns[item.id].price) - item.unitPrice) * item.quantity, 0);
  const deliveredValue = deliveries.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const difference = deliveredValue - returnedValue;
  const newTotal = (sale?.total ?? 0) + regularization + difference;
  const validReturns = selectedReturns.length > 0 && (sale?.items.every((item) => {
    const draft = returns[item.id];
    return draft && integer(draft.quantity) && Number(draft.quantity) <= item.quantity &&
      (Number(draft.quantity) === 0 || (!!item.variantId && !!draft.deposito && integer(draft.price)));
  }) ?? false);
  const canSave = validReturns && deliveries.length > 0 && reason.trim().length > 0 && settled &&
    (difference === 0 || !!payment) && Number.isSafeInteger(newTotal) && newTotal >= 0 && newTotal <= 2147483647;
  const updateReturn = (id: string, change: Partial<ReturnDraft>) => setReturns((current) => ({ ...current, [id]: { ...current[id], ...change } }));

  function chooseProduct(next: Product) {
    setProduct(next); setVariantId(''); setInventoryId(''); setProducts([]); setSearch('');
    const original = selectedReturns.find((item) => next.variants.some((variant) => variant.id === item.variantId));
    setPrice(original ? returns[original.id].price : next.price === null ? '' : String(next.price));
  }

  function addDelivery() {
    const location = inventory.find((item) => item.id === inventoryId);
    const variant = product?.variants.find((item) => item.id === variantId);
    if (!location || !variant || !product || !integer(quantity, 1) || !integer(price)) return;
    setDeliveries((current) => [...current, {
      inventoryItemId: location.id, quantity: Number(quantity), unitPrice: Number(price),
      label: `${product.name} · ${variant.color.label} / ${variant.size.label}`,
      deposito: location.deposito?.label ?? 'Sin depósito',
    }]);
    setQuantity('1');
  }

  async function save() {
    if (!sale || submitting.current || offline || (!retry && !canSave)) return;
    submitting.current = true; setBusy(true); setError(''); setNotice('');
    const input: SaleEditInput = retry ?? {
      requestId: crypto.randomUUID(), revision: sale.revision, reason: reason.trim(), settled: true,
      paymentMethod: difference === 0 ? null : payment as SaleEditInput['paymentMethod'],
      returns: selectedReturns.map((item) => ({ saleItemId: item.id,
        quantity: Number(returns[item.id].quantity), depositoId: returns[item.id].deposito === 'none' ? null : returns[item.id].deposito,
        ...(item.unitPrice === 0 ? { originalUnitPrice: Number(returns[item.id].price) } : {}),
      })),
      deliveries: deliveries.map(({ inventoryItemId, quantity: count, unitPrice }) => ({ inventoryItemId, quantity: count, unitPrice })),
    };
    try {
      await apiClient.post<SaleEdit>(`/api/v1/ventas/${saleId}/edits`, input);
      setRetry(null);
      setNotice('Cambio confirmado. La diferencia y los movimientos quedaron registrados.');
      await load();
      const refreshed = await refreshAfterSaleEdit();
      if (!refreshed) setNotice('Cambio confirmado. El respaldo offline necesita actualizarse al reconectar.');
    } catch (err) {
      if (err instanceof ApiError && err.status && err.status >= 400 && err.status < 500 && err.status !== 408 && err.status !== 429) {
        setRetry(null);
        setError(`${err.message}${err.status === 409 ? ' Recargá la venta para revisar el estado actual.' : ''}`);
      } else {
        setRetry(input);
        setError('No pudimos confirmar la respuesta. Reintentá la misma operación: no se duplicarán los movimientos ni el ajuste.');
      }
    } finally { submitting.current = false; setBusy(false); }
  }

  return (
    <PageContainer>
      <PageHeader title="Editar venta" description="Registrá cambios de artículos y diferencias ya cobradas o devueltas.">
        <Button asChild variant="outline"><Link href="/ventas/historial">Volver al historial</Link></Button>
      </PageHeader>
      {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800">{notice}</p>}
      {loading ? <p>Cargando venta…</p> : !sale ? <Button onClick={() => void load()}>Reintentar carga</Button> : <>
        <section className="mb-6 rounded-xl border bg-white p-4 text-sm">
          <p>Venta {sale.id} · {formatDate(sale.createdAt)}</p>
          <p className="mt-2 font-semibold">Punto de venta: {sale.pointOfSale?.label ?? 'Sin identificar'} · Total actual: {formatCurrency(sale.total)}</p>
          {sale.revision > 0 && <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">Venta editada</span>}
          <div className="mt-3 flex flex-wrap gap-4"><a href="#cambios" className="underline">Ver cambios ({history.length})</a>
            <button type="button" onClick={() => void load()} disabled={busy || !!retry} className="underline disabled:opacity-50">Recargar venta y descartar borrador</button></div>
        </section>
        {offline && <p role="status" className="mb-4 text-amber-800">La edición requiere conexión.</p>}
        {!sale.pointOfSaleId && <p role="alert">Esta venta requiere identificar su punto de venta antes de poder editarla.</p>}
        <fieldset disabled={busy || !!retry || offline || !sale.pointOfSaleId} className="min-w-0 space-y-6 disabled:opacity-70">
          <section className="space-y-4 rounded-xl border bg-white p-4 sm:p-6">
            <h2 className="text-lg font-semibold">1. Artículos que devuelve el cliente</h2>
            <p className="text-sm text-gray-600">Indicá cuántas unidades devuelve (0 para conservarlas) y dónde ingresan. Los precios en cero requieren confirmación explícita.</p>
            {sale.items.map((item) => {
              const draft = returns[item.id];
              if (!draft) return null;
              return <div key={item.id} className="space-y-3 rounded-lg border p-4">
                <p className="font-medium">{item.productName} · {item.colorName} / {item.sizeName}</p>
                <p className="text-sm text-gray-600">{item.quantity} unidades · {formatCurrency(item.unitPrice)} por unidad</p>
                {!item.variantId ? <p className="text-sm text-red-700">Variante eliminada: requiere resolver el artículo antes de devolverlo. Podés conservarlo y cambiar otros artículos.</p> :
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="text-sm">Unidades a devolver<Input type="number" min="0" max={item.quantity} step="1" value={draft.quantity} onChange={(event) => updateReturn(item.id, { quantity: event.target.value })} /></label>
                    {Number(draft.quantity) > 0 && <>
                      <label className="text-sm">Depósito de devolución<select className={selectClass} value={draft.deposito} onChange={(event) => updateReturn(item.id, { deposito: event.target.value })}>
                        <option value="">Seleccionar depósito</option><option value="none">Sin depósito</option>
                        {depositos.map((depot) => <option key={depot.id} value={depot.id}>{depot.label}</option>)}
                      </select></label>
                      <label className="text-sm">Precio original por unidad (ARS)<Input type="number" min="0" step="1" value={draft.price} readOnly={item.unitPrice !== 0} onChange={(event) => updateReturn(item.id, { price: event.target.value })} /></label>
                    </>}
                  </div>}
                {Number(draft.quantity) > 0 && item.unitPrice === 0 && <p className="text-xs text-amber-800">Ingresá el precio realmente cobrado, o 0 si fue gratuito. Se regulariza el precio de las {item.quantity} unidades de esta línea; no es un cobro nuevo.</p>}
              </div>;
            })}
          </section>

          <section className="space-y-4 rounded-xl border bg-white p-4 sm:p-6">
            <h2 className="text-lg font-semibold">2. Artículos que se entregan</h2>
            <label className="block text-sm">Buscar producto<Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre del producto" /></label>
            {products.length > 0 && <ul className="max-h-64 overflow-y-auto rounded-lg border">{products.map((item) => <li key={item.id}><button type="button" onClick={() => chooseProduct(item)} className="w-full p-3 text-left hover:bg-gray-50">{item.name}</button></li>)}</ul>}
            {product && <div className="space-y-3">
              <p className="font-medium">{product.name}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">Color / talle<select className={selectClass} value={variantId} onChange={(event) => setVariantId(event.target.value)}>
                  <option value="">Seleccionar variante</option>{product.variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.color.label} / {variant.size.label}</option>)}
                </select></label>
                <label className="text-sm">Depósito de entrega<select className={selectClass} value={inventoryId} onChange={(event) => setInventoryId(event.target.value)}>
                  <option value="">Seleccionar inventario</option>{inventory.map((location) => <option key={location.id} value={location.id}>{location.deposito?.label ?? 'Sin depósito'} · stock actual: {location.stock}</option>)}
                </select></label>
                <label className="text-sm">Cantidad<Input type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
                <label className="text-sm">Precio acordado por unidad (ARS)<Input type="number" min="0" step="1" value={price} onChange={(event) => setPrice(event.target.value)} /></label>
              </div>
              <Button type="button" variant="outline" disabled={!inventoryId || !integer(quantity, 1) || !integer(price) || deliveries.length >= 50} onClick={addDelivery}>Agregar entrega</Button>
              <p className="text-xs text-gray-600">El stock se verifica al confirmar, incluyendo las unidades devueltas. Revisá el precio acordado antes de agregar.</p>
            </div>}
            <ul className="space-y-2">{deliveries.map((item, index) => <li key={index} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm">
              <span>{item.label} · {item.deposito}<br />{item.quantity} × {formatCurrency(item.unitPrice)}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => setDeliveries((current) => current.filter((_, position) => position !== index))}>Quitar</Button>
            </li>)}</ul>
          </section>

          <section className="space-y-4 rounded-xl border bg-white p-4 sm:p-6">
            <h2 className="text-lg font-semibold">3. Resumen y confirmación</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <dt>Valor reconocido por devolución</dt><dd className="text-right">{formatCurrency(returnedValue)}</dd>
              <dt>Valor de la entrega</dt><dd className="text-right">{formatCurrency(deliveredValue)}</dd>
              <dt>Regularización histórica (sin cobro nuevo)</dt><dd className="text-right">{formatCurrency(regularization)}</dd>
              <dt className="font-semibold">{difference > 0 ? 'Diferencia cobrada' : difference < 0 ? 'Importe devuelto' : 'Sin diferencia'}</dt><dd className="text-right font-semibold">{formatCurrency(Math.abs(difference))}</dd>
              <dt>Nuevo total de la venta</dt><dd className="text-right">{formatCurrency(newTotal)}</dd>
            </dl>
            {difference !== 0 && <label className="block text-sm">Medio utilizado para la diferencia<select className={selectClass} value={payment} onChange={(event) => setPayment(event.target.value)}>
              <option value="">Seleccionar</option><option value="EFECTIVO">Efectivo</option><option value="MERCADO_PAGO">Mercado Pago / transferencia</option><option value="OTRO">Otro</option>
            </select></label>}
            <label className="block text-sm font-medium">Motivo del cambio (obligatorio)<textarea className={`${selectClass} min-h-24`} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Por ejemplo: el cliente solicitó otro talle." required /></label>
            <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={settled} onChange={(event) => setSettled(event.target.checked)} />Confirmo la devolución y entrega indicadas, y que ya cobré o devolví la diferencia si corresponde.</label>
          </section>
        </fieldset>
        <Button className="my-6" disabled={busy || offline || (!retry && !canSave)} onClick={() => void save()}>{busy ? 'Confirmando…' : retry ? 'Reintentar la misma operación' : 'Confirmar cambio'}</Button>

        <section id="cambios" className="scroll-mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Historial de cambios</h2>
          {history.length === 0 && <p className="text-sm text-gray-600">Esta venta todavía no fue editada.</p>}
          {history.map((edit) => <article key={edit.id} className="space-y-3 rounded-xl border bg-white p-4 text-sm">
            <h3 className="font-semibold">Edición {edit.revision} · {formatDate(edit.createdAt)} · {edit.actorName}</h3>
            <p className="whitespace-pre-wrap break-words">{edit.reason}</p>
            <p>{edit.difference > 0 ? 'Cobrado' : edit.difference < 0 ? 'Devuelto' : 'Sin diferencia'}: {formatCurrency(Math.abs(edit.difference))}{edit.paymentMethod ? ` · ${edit.paymentMethod}` : ''}</p>
            {edit.regularization !== 0 && <p>Regularización histórica, sin cobro nuevo: {formatCurrency(edit.regularization)}</p>}
            <ul className="space-y-1">{edit.movements.map((move, index) => <li key={index}>{move.direction === 'RETURN' ? '+' : '−'}{move.quantity} {move.productName} · {move.colorName} / {move.sizeName} · {move.depositoLabel} · {formatCurrency(move.unitPrice)} c/u</li>)}</ul>
            <details><summary className="cursor-pointer font-medium">Ver venta antes y después</summary><div className="mt-3 grid gap-4 sm:grid-cols-2">{([['Antes', edit.before], ['Después', edit.after]] as const).map(([label, snapshot]) => <div key={label}><h4 className="font-medium">{label} · {formatCurrency(snapshot.total)}</h4><ul>{snapshot.items.map((item) => <li key={item.id}>{item.quantity} × {item.productName} · {item.colorName} / {item.sizeName} · {formatCurrency(item.unitPrice)}</li>)}</ul></div>)}</div></details>
          </article>)}
        </section>
      </>}
    </PageContainer>
  );
}
