import { NextRequest } from 'next/server';
import { proxyTiendaNube } from '@/lib/tiendanube-server-proxy';

export async function GET() { return proxyTiendaNube('/campaigns'); }
export async function POST(request: NextRequest) { return proxyTiendaNube('/campaigns', { method: 'POST', body: await request.json() }); }
