'use client';

import { useEffect, useState, useTransition } from 'react';
import { Check, Clock3, Loader2, Phone, RefreshCcw, Store, XCircle } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { CatalogOrder, CatalogOrderStatus } from '@/types/catalog';
import { useSettingsStore } from '@/stores/settings-store';
import { useToastStore } from '@/stores/toast-store';

const statusLabels: Record<CatalogOrderStatus, string> = {
  PENDING_PAYMENT: 'Pendiente de pago',
  PAYMENT_REPORTED: 'Comprobante recibido',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  REJECTED: 'Rechazado',
  OUT_OF_STOCK: 'Sin stock',
};

const statusClasses: Record<CatalogOrderStatus, string> = {
  PENDING_PAYMENT: 'bg-amber-50 text-amber-700 border-amber-200',
  PAYMENT_REPORTED: 'bg-sky-50 text-sky-700 border-sky-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-gray-100 text-gray-700 border-gray-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  OUT_OF_STOCK: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function VentasPuntoDeVentaPage() {
  const { pointsOfSale, fetchPointsOfSale } = useSettingsStore();
  const addToast = useToastStore((state) => state.addToast);
  const [orders, setOrders] = useState<CatalogOrder[]>([]);
  const [status, setStatus] = useState<string>('');
  const [pointOfSaleId, setPointOfSaleId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<CatalogOrder[]>('/api/v1/catalog/orders', {
        status: status || undefined,
        pointOfSaleId: pointOfSaleId || undefined,
        page: 1,
        limit: 50,
      });
      setOrders(response.data ?? []);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'No se pudieron cargar los pedidos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPointsOfSale();
  }, [fetchPointsOfSale]);

  useEffect(() => {
    loadOrders();
  }, [status, pointOfSaleId]);

  const handleAction = (orderId: string, action: 'report-payment' | 'confirm' | 'cancel' | 'reject') => {
    setPendingOrderId(orderId);
    startTransition(async () => {
      try {
        await apiClient.post(`/api/v1/catalog/orders/${orderId}/${action}`, {});
        addToast('Pedido actualizado correctamente', 'success');
        await loadOrders();
      } catch (error) {
        addToast(error instanceof Error ? error.message : 'No se pudo actualizar el pedido', 'error');
      } finally {
        setPendingOrderId(null);
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Ventas de punto de venta"
        description="Confirmá pagos del catálogo web y convertí cada pedido en una venta real"
      >
        <Button variant="outline" className="gap-2" onClick={loadOrders} disabled={isLoading || isPending}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Actualizar
        </Button>
      </PageHeader>

      <Card className="mb-6">
        <CardContent className="grid gap-4 p-6 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Estado</label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">Todos</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Punto de venta</label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              value={pointOfSaleId}
              onChange={(event) => setPointOfSaleId(event.target.value)}
            >
              <option value="">Todos</option>
              {pointsOfSale.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-600">
            <p className="font-medium text-gray-900">{orders.length} pedido{orders.length === 1 ? '' : 's'}</p>
            <p>Los descuentos de stock se aplican solo al confirmar el pago.</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center gap-3 p-6 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando pedidos...
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-gray-500">
              No hay pedidos para los filtros seleccionados.
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => {
            const isWorking = pendingOrderId === order.id && isPending;
            const canReport = order.status === 'PENDING_PAYMENT';
            const canConfirm = order.status === 'PENDING_PAYMENT' || order.status === 'PAYMENT_REPORTED';
            const canCancel = order.status !== 'CONFIRMED' && order.status !== 'CANCELLED';
            const canReject = order.status !== 'CONFIRMED' && order.status !== 'REJECTED';

            return (
              <Card key={order.id}>
                <CardHeader className="gap-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-base">Pedido {order.id.slice(0, 8)}</CardTitle>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="font-medium text-gray-900">
                          {order.customerFirstName} {order.customerLastName}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {order.customerPhone}
                        </p>
                        <p className="flex items-center gap-2">
                          <Store className="h-4 w-4" />
                          {order.pointOfSale.label}
                        </p>
                        <p>Creado: {formatDate(order.createdAt)}</p>
                        <p>Pago: Mercado Pago/Transferencia</p>
                      </div>
                    </div>

                    <div className="min-w-44 rounded-xl border bg-gray-50 px-4 py-3 text-sm">
                      <p className="text-gray-500">Total pedido</p>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                      {order.sale && (
                        <p className="mt-2 text-xs text-emerald-700">Venta asociada: {order.sale.id.slice(0, 8)}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3 rounded-xl border bg-gray-50 p-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                        <div>
                          <p className="font-medium text-gray-900">{item.productNameSnapshot}</p>
                          <p className="text-sm text-gray-500">
                            {item.colorNameSnapshot} / {item.sizeNameSnapshot}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">{item.quantity} x {formatCurrency(item.unitPriceSnapshot)}</p>
                          <p className="text-gray-500">{formatCurrency(item.quantity * item.unitPriceSnapshot)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="rounded-xl border px-4 py-3 text-sm text-gray-600">
                      <span className="font-medium text-gray-900">Notas:</span> {order.notes}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="gap-2"
                      disabled={!canReport || isWorking}
                      onClick={() => handleAction(order.id, 'report-payment')}
                    >
                      {isWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock3 className="h-4 w-4" />}
                      Marcar comprobante
                    </Button>
                    <Button
                      className="gap-2"
                      disabled={!canConfirm || isWorking}
                      onClick={() => handleAction(order.id, 'confirm')}
                    >
                      <Check className="h-4 w-4" />
                      Confirmar pago
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      disabled={!canCancel || isWorking}
                      onClick={() => handleAction(order.id, 'cancel')}
                    >
                      <XCircle className="h-4 w-4" />
                      Cancelar
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 text-rose-600"
                      disabled={!canReject || isWorking}
                      onClick={() => handleAction(order.id, 'reject')}
                    >
                      <XCircle className="h-4 w-4" />
                      Rechazar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </PageContainer>
  );
}
