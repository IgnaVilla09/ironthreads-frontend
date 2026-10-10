import { NextRequest } from 'next/server';
import { proxyTiendaNube } from '@/lib/tiendanube-server-proxy';

const actions = new Set(['send-test', 'schedule', 'pause', 'cancel']);
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; action: string }> }) {
  const { id, action } = await params;
  if (!actions.has(action)) return Response.json({ error: 'Acción inválida' }, { status: 404 });
  const body = action === 'pause' || action === 'cancel' ? undefined : await request.json();
  return proxyTiendaNube(`/campaigns/${id}/${action}`, { method: 'POST', body });
}
