'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Mail, Plus, Users } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { tiendaNubeApiClient } from '@/lib/tiendanube-api-client';
import { useToastStore } from '@/stores/toast-store';

type EmailSendLog = Awaited<ReturnType<typeof tiendaNubeApiClient.getEmailHistory>>[number];

export default function EmailHistoryPage() {
  const addToast = useToastStore((state) => state.addToast);
  const [history, setHistory] = useState<EmailSendLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void tiendaNubeApiClient.getEmailHistory()
      .then(setHistory)
      .catch((error) => addToast(error instanceof Error ? error.message : 'No se pudo cargar el historial de emails.', 'error'))
      .finally(() => setLoading(false));
  }, [addToast]);

  return <PageContainer>
    <PageHeader title="Emails" description="Historial de envíos realizados con Resend.">
      <div className="flex gap-2"><Link href="/gestion-tienda-nube"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Volver</Button></Link><Link href="/gestion-tienda-nube/emails/new"><Button><Plus className="mr-2 h-4 w-4" />Nuevo envío</Button></Link></div>
    </PageHeader>
    <Card><CardContent className="pt-6"><Table><TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Destinatarios</TableHead><TableHead>Asunto</TableHead><TableHead>Excluidos</TableHead><TableHead>Fecha</TableHead></TableRow></TableHeader><TableBody>{history.map((entry) => <TableRow key={entry.id}><TableCell><Badge variant="secondary" className="gap-1">{entry.type === 'bulk' ? <Users className="h-3 w-3" /> : <Mail className="h-3 w-3" />}{entry.type === 'bulk' ? 'Masivo' : 'Puntual'}</Badge></TableCell><TableCell>{entry.type === 'bulk' ? `${entry.recipientCount} emails` : entry.recipient}</TableCell><TableCell className="max-w-72 truncate">{entry.subject}</TableCell><TableCell>{entry.suppressedCount || '-'}</TableCell><TableCell>{new Date(entry.createdAt).toLocaleString('es-AR')}</TableCell></TableRow>)}{!loading && history.length === 0 ? <TableRow><TableCell colSpan={5} className="h-28 text-center text-muted-foreground">Todavía no hay envíos de Resend registrados.</TableCell></TableRow> : null}</TableBody></Table></CardContent></Card>
  </PageContainer>;
}
