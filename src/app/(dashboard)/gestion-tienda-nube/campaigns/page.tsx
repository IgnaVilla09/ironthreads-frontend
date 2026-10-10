'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Megaphone, Plus, RefreshCw } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tiendaNubeApiClient } from '@/lib/tiendanube-api-client';
import { useToastStore } from '@/stores/toast-store';
import type { Campaign } from '@/types/tiendanube';

export default function CampaignsPage() {
  const addToast = useToastStore((state) => state.addToast);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { setCampaigns(await tiendaNubeApiClient.getCampaigns()); } catch (error) { addToast(error instanceof Error ? error.message : 'No se pudieron cargar las campañas.', 'error'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  return <PageContainer><PageHeader title="Campañas" description="Creá, probá y programá comunicaciones HTML para clientes que aceptaron marketing."><div className="flex gap-2"><Link href="/gestion-tienda-nube"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Volver</Button></Link><Link href="/gestion-tienda-nube/campaigns/new"><Button><Plus className="mr-2 h-4 w-4" />Nueva campaña</Button></Link></div></PageHeader>
    <div className="mb-6 flex items-center justify-between rounded-lg border bg-muted/30 p-4 text-sm"><div className="flex items-center gap-3"><Megaphone className="h-5 w-5 text-primary" /><span>Incluye baja de suscripción y envío por lotes para proteger la entregabilidad.</span></div><Button variant="ghost" size="sm" onClick={() => void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button></div>
    <div className="grid gap-4">{campaigns.map((campaign) => <Link key={campaign.id} href={`/gestion-tienda-nube/campaigns/${campaign.id}`}><Card className="transition-shadow hover:shadow-md"><CardHeader className="flex-row items-start justify-between gap-4"><div><CardTitle>{campaign.name}</CardTitle><CardDescription className="mt-2">{campaign.subject}</CardDescription></div><Badge variant={campaign.status === 'completed' ? 'default' : 'secondary'}>{campaign.status}</Badge></CardHeader><CardContent className="flex gap-6 text-sm text-muted-foreground"><span>{campaign.sentCount}/{campaign.totalRecipients} enviados</span><span>{campaign.failedCount} errores</span>{campaign.sendAt ? <span>Programada: {new Date(campaign.sendAt).toLocaleString('es-AR')}</span> : null}</CardContent></Card></Link>)}{!loading && campaigns.length === 0 ? <Card><CardContent className="py-14 text-center text-muted-foreground">Aún no hay campañas. Creá una para comenzar.</CardContent></Card> : null}</div>
  </PageContainer>;
}
