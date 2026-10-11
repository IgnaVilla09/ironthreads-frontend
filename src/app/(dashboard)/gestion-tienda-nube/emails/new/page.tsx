'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { tiendaNubeApiClient } from '@/lib/tiendanube-api-client';
import { useToastStore } from '@/stores/toast-store';
import type { CampaignTemplate } from '@/types/tiendanube';

type RecipientMode = 'audience' | 'single';

export default function NewCampaignPage() {
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [templateName, setTemplateName] = useState('custom');
  const [recipientMode, setRecipientMode] = useState<RecipientMode>('audience');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [minTotalSpent, setMinTotalSpent] = useState('');
  const [audience, setAudience] = useState<number | null>(null);
  const [confirmBulkSend, setConfirmBulkSend] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void tiendaNubeApiClient.getCampaignTemplates()
      .then((items) => {
        setTemplates(items);
        if (items[0]) {
          setTemplateName(items[0].key);
          setSubject(items[0].subject);
          setHtml(items[0].html);
        }
      })
      .catch(() => addToast('No se pudieron cargar las plantillas.', 'error'));
  }, [addToast]);

  const selectTemplate = (key: string) => {
    setTemplateName(key);
    const template = templates.find((item) => item.key === key);
    if (template) {
      setSubject(template.subject);
      setHtml(template.html);
    }
  };

  const previewAudience = async () => {
    try {
      const result = await tiendaNubeApiClient.previewCampaignAudience(
        minTotalSpent ? { minTotalSpent: Number(minTotalSpent) } : {},
      );
      setAudience(result.total);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'No se pudo calcular la audiencia.', 'error');
    }
  };

  const save = async () => {
    if (!subject.trim() || !html.trim()) {
      addToast('Completá asunto y contenido.', 'error');
      return;
    }
    if (recipientMode === 'single' && !/^\S+@\S+\.\S+$/.test(recipientEmail.trim())) {
      addToast('Ingresá un email válido para el destinatario.', 'error');
      return;
    }

    setSaving(true);
    try {
      if (recipientMode === 'single') {
        await tiendaNubeApiClient.sendDirectEmail({ to: recipientEmail.trim(), subject, html });
        addToast(`Email enviado a ${recipientEmail.trim()}.`, 'success');
        router.push('/gestion-tienda-nube/emails');
        return;
      }

      if (!confirmBulkSend) {
        addToast('Confirmá el envío masivo antes de continuar.', 'error');
        return;
      }
      const result = await tiendaNubeApiClient.sendBulkEmail({ subject, html, ...(minTotalSpent ? { minTotalSpent: Number(minTotalSpent) } : {}) });
      addToast(`${result.sent} emails enviados con Resend. ${result.suppressed} excluidos por lista negra.`, 'success');
      router.push('/gestion-tienda-nube/emails');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'No se pudo crear la campaña.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return <PageContainer>
    <PageHeader title="Nuevo envío por email" description="Enviá la plantilla con Resend a una audiencia o a un cliente puntual de Tienda Nube.">
      <Link href="/gestion-tienda-nube/emails"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Volver</Button></Link>
    </PageHeader>
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>1. Destinatarios</CardTitle><CardDescription>Los envíos masivos solo incluyen clientes con consentimiento, sin baja y fuera de la lista negra.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex flex-1 cursor-pointer items-start gap-3 rounded-md border p-3">
                <input type="radio" name="recipient-mode" value="audience" checked={recipientMode === 'audience'} onChange={() => setRecipientMode('audience')} className="mt-1" />
                <span><span className="block font-medium">Audiencia</span><span className="text-sm text-muted-foreground">Enviar a clientes según los filtros.</span></span>
              </label>
              <label className="flex flex-1 cursor-pointer items-start gap-3 rounded-md border p-3">
                <input type="radio" name="recipient-mode" value="single" checked={recipientMode === 'single'} onChange={() => setRecipientMode('single')} className="mt-1" />
                <span><span className="block font-medium">Cliente puntual</span><span className="text-sm text-muted-foreground">Enviar únicamente a un email.</span></span>
              </label>
            </div>
            {recipientMode === 'single' ? <div>
              <Label htmlFor="recipient-email">Email del cliente</Label>
              <Input id="recipient-email" type="email" value={recipientEmail} onChange={(event) => setRecipientEmail(event.target.value)} placeholder="cliente@ejemplo.com" />
            </div> : <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1"><Label htmlFor="minimum">Compra acumulada mínima (opcional)</Label><Input id="minimum" type="number" min="0" value={minTotalSpent} onChange={(event) => setMinTotalSpent(event.target.value)} placeholder="Ej. 20000" /></div>
              <Button variant="outline" onClick={() => void previewAudience()}>Calcular audiencia</Button>
              {audience !== null ? <strong className="text-primary">{audience} contactos</strong> : null}
            </div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>2. Contenido</CardTitle><CardDescription>En envíos masivos, <code>{'{{name}}'}</code> se reemplaza por el nombre del cliente. Incluí los links y datos de la tienda directamente en el HTML.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div><Label htmlFor="template">Plantilla inicial</Label><Select id="template" value={templateName} onChange={(event) => selectTemplate(event.target.value)} options={[...templates.map((item) => ({ value: item.key, label: item.label })), { value: 'custom', label: 'HTML personalizado' }]} /></div>
            <div><Label htmlFor="subject">Asunto</Label><Input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} /></div>
            <div><Label htmlFor="html">HTML</Label><textarea id="html" value={html} onChange={(event) => setHtml(event.target.value)} className="min-h-72 w-full rounded-md border bg-background px-3 py-2 font-mono text-sm" /></div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Vista previa</CardTitle><CardDescription>Así se verá el contenido de la plantilla.</CardDescription></CardHeader>
          <CardContent><iframe title="Vista previa de la plantilla" srcDoc={html} className="h-[430px] w-full rounded-md border bg-white" sandbox="" /></CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader><CardTitle>{recipientMode === 'single' ? 'Enviar a un cliente' : 'Enviar masivamente'}</CardTitle><CardDescription>{recipientMode === 'single' ? 'El email se enviará solo al destinatario indicado.' : 'Resend enviará únicamente a clientes con consentimiento, sin baja y fuera de la lista negra.'}</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {recipientMode === 'audience' ? <label className="flex cursor-pointer items-start gap-2 text-sm"><input type="checkbox" checked={confirmBulkSend} onChange={(event) => setConfirmBulkSend(event.target.checked)} className="mt-1" /><span>Confirmo que deseo enviar este email masivo ahora.</span></label> : null}
            <Button className="w-full" onClick={() => void save()} disabled={saving || (recipientMode === 'audience' && !confirmBulkSend)}>{saving ? 'Enviando...' : recipientMode === 'single' ? 'Enviar email' : 'Enviar con Resend'}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </PageContainer>;
}
