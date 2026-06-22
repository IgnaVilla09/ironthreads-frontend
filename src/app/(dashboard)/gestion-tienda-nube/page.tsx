'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertTriangle, FileText, PackageSearch, RefreshCw } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { tiendaNubeApiClient } from '@/lib/tiendanube-api-client';

const sections = [
  {
    title: 'Carritos abandonados',
    description: 'Listado principal, detalle operativo y seguimiento por carrito.',
    href: '/gestion-tienda-nube/checkouts',
    icon: PackageSearch,
  },
  {
    title: 'Logs de recovery',
    description: 'Revision de mensajes enviados, errores y ultimos eventos procesados.',
    href: '/gestion-tienda-nube/logs',
    icon: FileText,
  },
];

export default function GestionTiendaNubePage() {
  const [healthOk, setHealthOk] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadHealth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tiendaNubeApiClient.getHealth();
      setHealthOk(response?.ok === true);
    } catch (requestError) {
      setHealthOk(false);
      setError(requestError instanceof Error ? requestError.message : 'No se pudo verificar la API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadHealth();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Gestion Tienda Nube"
        description="Monitoreo basico de disponibilidad del backend externo."
      >
        <Button variant="outline" className="gap-2" onClick={() => void loadHealth()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Reconsultar health
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Estado de la API</CardTitle>
              <CardDescription>Verificacion del endpoint publico `GET /health`.</CardDescription>
            </div>
            <Badge variant={healthOk === false ? 'destructive' : 'default'}>
              {healthOk === null ? 'Consultando' : healthOk ? 'Disponible' : 'No disponible'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Base URL activa: <span className="font-medium text-foreground">{tiendaNubeApiClient.baseUrl}</span>
          </p>
          {error ? (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <p>El modulo solo mantiene el chequeo de disponibilidad del backend.</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <section.icon className="h-5 w-5" />
              </div>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={section.href}>
                <Button variant="outline" className="w-full">
                  Abrir seccion
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
