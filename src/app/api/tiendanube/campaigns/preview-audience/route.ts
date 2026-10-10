import { NextRequest } from 'next/server';
import { proxyTiendaNube } from '@/lib/tiendanube-server-proxy';

export async function POST(request: NextRequest) { return proxyTiendaNube('/campaigns/preview-audience', { method: 'POST', body: await request.json() }); }
