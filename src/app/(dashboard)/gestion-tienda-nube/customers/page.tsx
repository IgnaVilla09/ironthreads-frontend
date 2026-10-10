'use client';

import { startTransition, useDeferredValue, useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { tiendaNubeApiClient } from '@/lib/tiendanube-api-client';
import { useToastStore } from '@/stores/toast-store';
import type { CustomersResponse } from '@/types/tiendanube';

const EMPTY: CustomersResponse = { items: [], total: 0, page: 1, perPage: 25 };

function money(value: string | null, currency: string | null) {
  if (!value) return '-';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: currency || 'ARS', maximumFractionDigits: 0 }).format(Number(value));
}

export default function CustomersPage() {
  const addToast = useToastStore((state) => state.addToast);
  const [data, setData] = useState<CustomersResponse>(EMPTY);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [onlyMarketing, setOnlyMarketing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const result = await tiendaNubeApiClient.getCustomers({ page, perPage: 25, search: deferredSearch || undefined, acceptsMarketing: onlyMarketing ? 'true' : undefined });
      startTransition(() => setData(result));
    } catch (error) { addToast(error instanceof Error ? error.message : 'No se pudieron cargar los clientes.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(1); }, [deferredSearch, onlyMarketing]);

  const sync = async () => {
    setSyncing(true);
    try { await tiendaNubeApiClient.syncCustomers(); addToast('Sincronización de clientes iniciada.', 'success'); await load(1); }
    catch (error) { addToast(error instanceof Error ? error.message : 'No se pudo sincronizar.', 'error'); }
    finally { setSyncing(false); }
  };

  return <PageContainer>
    <PageHeader title="Clientes" description="Contactos sincronizados desde Tienda Nube. Las campañas solo usan contactos con consentimiento.">
      <div className="flex gap-2"><Link href="/gestion-tienda-nube"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Volver</Button></Link><Button onClick={() => void sync()} disabled={syncing}><RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />Sincronizar</Button></div>
    </PageHeader>
    <div className="mb-6 grid gap-4 sm:grid-cols-3"><Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Clientes visibles</p><p className="mt-1 text-3xl font-semibold">{data.total}</p></CardContent></Card><Card className="sm:col-span-2"><CardContent className="flex flex-col gap-3 pt-6 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Buscar por nombre o email" /></div><Button variant={onlyMarketing ? 'default' : 'outline'} onClick={() => setOnlyMarketing((value) => !value)}>Solo con consentimiento</Button></CardContent></Card></div>
    <Card><CardContent className="pt-6"><Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Contacto</TableHead><TableHead>Compras</TableHead><TableHead>Consentimiento</TableHead><TableHead>Tienda</TableHead></TableRow></TableHeader><TableBody>{data.items.map((customer) => <TableRow key={customer.id}><TableCell className="font-medium">{customer.name || 'Sin nombre'}</TableCell><TableCell><div>{customer.email}</div><div className="text-xs text-muted-foreground">{customer.phone || '-'}</div></TableCell><TableCell>{money(customer.totalSpent, customer.totalSpentCurrency)}</TableCell><TableCell><Badge variant={customer.acceptsMarketing ? 'default' : 'secondary'}>{customer.acceptsMarketing ? 'Aceptó marketing' : 'Sin consentimiento'}</Badge></TableCell><TableCell>{customer.storeIntegration.storeId}</TableCell></TableRow>)}{!loading && data.items.length === 0 ? <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No hay clientes para estos filtros.</TableCell></TableRow> : null}</TableBody></Table></CardContent></Card>
    <div className="mt-4 flex items-center justify-between"><p className="text-sm text-muted-foreground">Página {data.page} de {Math.max(1, Math.ceil(data.total / data.perPage))}</p><div className="flex gap-2"><Button variant="outline" disabled={loading || data.page <= 1} onClick={() => void load(data.page - 1)}>Anterior</Button><Button variant="outline" disabled={loading || data.page * data.perPage >= data.total} onClick={() => void load(data.page + 1)}>Siguiente</Button></div></div>
  </PageContainer>;
}
