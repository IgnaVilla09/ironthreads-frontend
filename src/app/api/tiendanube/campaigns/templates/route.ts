import { proxyTiendaNube } from '@/lib/tiendanube-server-proxy';

export async function GET() { return proxyTiendaNube('/campaigns/templates'); }
