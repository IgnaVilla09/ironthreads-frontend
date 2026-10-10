import { proxyTiendaNube } from '@/lib/tiendanube-server-proxy';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) { return proxyTiendaNube(`/campaigns/${(await params).id}`); }
