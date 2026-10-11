import { NextRequest } from 'next/server';
import { proxyTiendaNube } from '@/lib/tiendanube-server-proxy';

export async function GET() {
  return proxyTiendaNube('/email-suppressions');
}

export async function POST(request: NextRequest) {
  return proxyTiendaNube('/email-suppressions', { method: 'POST', body: await request.json() });
}
