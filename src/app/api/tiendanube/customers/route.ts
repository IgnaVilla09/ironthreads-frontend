import { NextRequest } from 'next/server';
import { proxyTiendaNube } from '@/lib/tiendanube-server-proxy';

export async function GET(request: NextRequest) {
  return proxyTiendaNube(`/customers${request.nextUrl.search}`);
}
