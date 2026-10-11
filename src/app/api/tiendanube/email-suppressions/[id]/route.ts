import { proxyTiendaNube } from '@/lib/tiendanube-server-proxy';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyTiendaNube(`/email-suppressions/${id}`, { method: 'DELETE' });
}
