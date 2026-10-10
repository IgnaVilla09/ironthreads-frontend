import { proxyTiendaNube } from '@/lib/tiendanube-server-proxy';

export async function POST() { return proxyTiendaNube('/customers/sync', { method: 'POST' }); }
