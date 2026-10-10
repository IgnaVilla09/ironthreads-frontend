'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Eye, Send } from 'lucide-react';
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

export default function NewCampaignPage() {
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [name, setName] = useState(''); const [subject, setSubject] = useState(''); const [html, setHtml] = useState('');
  const [templateName, setTemplateName] = useState('custom'); const [minTotalSpent, setMinTotalSpent] = useState(''); const [audience, setAudience] = useState<number | null>(null); const [saving, setSaving] = useState(false);
  useEffect(() => { void tiendaNubeApiClient.getCampaignTemplates().then((items) => { setTemplates(items); if (items[0]) { setTemplateName(items[0].key); setSubject(items[0].subject); setHtml(items[0].html); } }).catch(() => addToast('No se pudieron cargar las plantillas.', 'error')); }, []);
  const selectTemplate = (key: string) => { setTemplateName(key); const template = templates.find((item) => item.key === key); if (template) { setSubject(template.subject); setHtml(template.html); } };
  const previewAudience = async () => { try { const result = await tiendaNubeApiClient.previewCampaignAudience(minTotalSpent ? { minTotalSpent: Number(minTotalSpent) } : {}); setAudience(result.total); } catch (error) { addToast(error instanceof Error ? error.message : 'No se pudo calcular la audiencia.', 'error'); } };
  const save = async () => { if (!name.trim() || !subject.trim() || !html.trim()) { addToast('Completá nombre, asunto y contenido.', 'error'); return; } setSaving(true); try { const campaign = await tiendaNubeApiClient.createCampaign({ name, subject, html, templateName, ...(minTotalSpent ? { minTotalSpent: Number(minTotalSpent) } : {}) }); addToast('Campaña guardada como borrador.', 'success'); router.push(`/gestion-tienda-nube/campaigns/${campaign.id}`); } catch (error) { addToast(error instanceof Error ? error.message : 'No se pudo crear la campaña.', 'error'); } finally { setSaving(false); } };
  return <PageContainer><PageHeader title="Nueva campaña" description="Los destinatarios se filtran siempre por consentimiento de marketing y baja activa."><Link href="/gestion-tienda-nube/campaigns"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Volver</Button></Link></PageHeader><div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]"><div className="space-y-6"><Card><CardHeader><CardTitle>1. Audiencia</CardTitle><CardDescription>Solo clientes de Tienda Nube que aceptaron recibir novedades.</CardDescription></CardHeader><CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end"><div className="flex-1"><Label htmlFor="minimum">Compra acumulada mínima (opcional)</Label><Input id="minimum" type="number" min="0" value={minTotalSpent} onChange={(event) => setMinTotalSpent(event.target.value)} placeholder="Ej. 20000" /></div><Button variant="outline" onClick={() => void previewAudience()}>Calcular audiencia</Button>{audience !== null ? <strong className="text-primary">{audience} contactos</strong> : null}</CardContent></Card><Card><CardHeader><CardTitle>2. Contenido</CardTitle><CardDescription>Usá variables: <code>{'{{name}}'}</code>, <code>{'{{store_name}}'}</code>, <code>{'{{cta_url}}'}</code>. El link de baja se agrega automáticamente.</CardDescription></CardHeader><CardContent className="space-y-4"><div><Label htmlFor="campaign-name">Nombre interno</Label><Input id="campaign-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Semana de descuentos" /></div><div><Label htmlFor="template">Plantilla inicial</Label><Select id="template" value={templateName} onChange={(event) => selectTemplate(event.target.value)} options={[...templates.map((item) => ({ value: item.key, label: item.label })), { value: 'custom', label: 'HTML personalizado' }]} /></div><div><Label htmlFor="subject">Asunto</Label><Input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} /></div><div><Label htmlFor="html">HTML</Label><textarea id="html" className="mt-2 min-h-80 w-full rounded-md border border-input bg-white p-3 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={html} onChange={(event) => setHtml(event.target.value)} /></div></CardContent></Card><Button onClick={() => void save()} disabled={saving}><Send className="mr-2 h-4 w-4" />{saving ? 'Guardando...' : 'Guardar borrador'}</Button></div><Card className="h-fit"><CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-4 w-4" />Vista previa</CardTitle><CardDescription>Render aproximado del email antes del envío de prueba.</CardDescription></CardHeader><CardContent><iframe title="Vista previa del correo" srcDoc={html} className="min-h-[560px] w-full border bg-white" sandbox="" /></CardContent></Card></div></PageContainer>;
}
