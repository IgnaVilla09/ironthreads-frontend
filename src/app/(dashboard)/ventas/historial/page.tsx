'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { Sale } from '@/types/venta';
import { PaginationMeta } from '@/types/api';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { ShoppingCart, ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function todayStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function monthAgoStr() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split('T')[0];
}

export default function HistorialVentasPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState(monthAgoStr());
  const [dateTo, setDateTo] = useState(todayStr());
  const [isExporting, setIsExporting] = useState(false);

  const fetchSales = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<Sale[]>('/api/v1/ventas', {
        page: p,
        limit: 20,
      });
      setSales(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch {
      setSales([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales(page);
  }, [page, fetchSales]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({ from: dateFrom, to: dateTo });
      const url = `${API_BASE}/api/v1/ventas/export?${params}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al exportar');

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `ventas-${dateFrom}-${dateTo}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch {
      alert('Error al exportar el informe');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Historial de ventas"
        description="Descuentos de stock realizados"
      >
        <Link href="/ventas">
          <Button className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Nueva venta
          </Button>
        </Link>
      </PageHeader>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Desde</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Hasta</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9"
              />
            </div>
            <Button
              onClick={handleExport}
              disabled={isExporting || !dateFrom || !dateTo}
              className="gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? 'Exportando...' : 'Exportar a Excel'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingState />
          ) : sales.length === 0 ? (
            <EmptyState title="No hay ventas registradas" description="Aún no se ha realizado ninguna venta." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Fecha</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Producto</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Unidad</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Talle</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Cant.</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">Método de pago</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Observaciones</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Total items</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sales.map((sale) => (
                    <SaleRow key={sale.id} sale={sale} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Página {meta.page} de {meta.totalPages} · {meta.total} ventas
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= (meta.totalPages ?? 1)}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

function SaleRow({ sale }: { sale: Sale }) {
  const paymentLabel = sale.paymentMethod === 'EFECTIVO' ? 'Efectivo' :
    sale.paymentMethod === 'MERCADO_PAGO' ? 'Mercado Pago' : 'Otro';
  const paymentClass = sale.paymentMethod === 'EFECTIVO'
    ? 'bg-green-50 text-green-700 border-green-200'
    : sale.paymentMethod === 'MERCADO_PAGO'
    ? 'bg-sky-50 text-sky-700 border-sky-200'
    : 'bg-orange-50 text-orange-700 border-orange-200';

  return (
    <>
      {sale.items.map((item, idx) => (
        <tr key={`${sale.id}-${idx}`} className="hover:bg-gray-50/50">
          {idx === 0 && (
            <td
              className="px-4 py-3 text-gray-500 align-top"
              rowSpan={sale.items.length}
            >
              {formatDate(sale.createdAt)}
            </td>
          )}
          <td className="px-4 py-3 font-medium text-gray-900">{item.productName}</td>
          <td className="px-4 py-3 text-gray-600">{item.colorName}</td>
          <td className="px-4 py-3 text-gray-600">{item.sizeName}</td>
          <td className="px-4 py-3 text-right tabular-nums">{item.quantity}</td>
          {idx === 0 && (
            <td
              className="px-4 py-3 text-center align-top"
              rowSpan={sale.items.length}
            >
              <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', paymentClass)}>
                {paymentLabel}
              </span>
            </td>
          )}
          {idx === 0 && (
            <td
              className="px-4 py-3 text-gray-500 align-top max-w-[200px] break-words"
              rowSpan={sale.items.length}
            >
              {sale.observaciones || '-'}
            </td>
          )}
          {idx === 0 && (
            <td
              className="px-4 py-3 text-right tabular-nums align-top font-medium"
              rowSpan={sale.items.length}
            >
              {sale.items.reduce((sum, i) => sum + i.quantity, 0)}
            </td>
          )}
        </tr>
      ))}
    </>
  );
}
