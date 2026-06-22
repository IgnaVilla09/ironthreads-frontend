'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingState } from '@/components/shared/loading-state';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { tiendaNubeApiClient } from '@/lib/tiendanube-api-client';
import { useToastStore } from '@/stores/toast-store';
import { MessageLog } from '@/types/tiendanube';

function formatDate(value: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export default function GestionTiendaNubeLogsPage() {
  const addToast = useToastStore((state) => state.addToast);
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await tiendaNubeApiClient.getMessageLogs();
      setLogs(data);
      addToast('Logs cargados correctamente', 'success');
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'No se pudieron cargar los logs.';
      setError(message);
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Logs de recovery"
        description="Historial reciente consumiendo `GET /admin/message-logs` (maximo 200 registros)."
      >
        <div className="flex items-center gap-2">
          <Link href="/gestion-tienda-nube">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
          <Button variant="outline" className="gap-2" onClick={() => void loadLogs()} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refrescar
          </Button>
        </div>
      </PageHeader>
      {isLoading ? <LoadingState count={6} /> : null}

      {!isLoading && error ? <ErrorState message={error} onRetry={() => void loadLogs()} /> : null}

      {!isLoading && !error && logs.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              title="Sin logs cargados"
              description="Presiona refrescar para consultar los ultimos eventos de recovery disponibles para tu usuario."
            />
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !error && logs.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Checkout</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === 'error' ? 'destructive' : 'secondary'}>{log.status}</Badge>
                    </TableCell>
                    <TableCell>{log.templateName}</TableCell>
                    <TableCell>{log.recipient || '-'}</TableCell>
                    <TableCell className="font-medium">{log.abandonedCheckoutId}</TableCell>
                    <TableCell className="max-w-xs truncate">{log.errorMessage || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </PageContainer>
  );
}
