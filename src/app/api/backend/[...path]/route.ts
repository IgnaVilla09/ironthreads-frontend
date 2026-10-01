import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { APP_SESSION_COOKIE, getBackendApiBase } from '@/lib/server-auth';

const allowed = new Set(['products', 'analytics', 'settings', 'ventas', 'inventory', 'catalog', 'health']);

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (!allowed.has(path[0]) || path.some((segment) => segment === '.' || segment === '..')) {
    return NextResponse.json({ success: false }, { status: 404 });
  }
  const token = (await cookies()).get(APP_SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ success: false, error: { message: 'Sesión requerida' } }, { status: 401 });
  try {
    const response = await fetch(`${getBackendApiBase()}/api/v1/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`, {
      method: request.method,
      headers: { Authorization: `Bearer ${token}`, ...(request.method !== 'GET' ? { 'Content-Type': 'application/json' } : {}) },
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text(),
      cache: 'no-store',
    });
    return new NextResponse(response.body, { status: response.status, headers: {
      'Content-Type': response.headers.get('Content-Type') ?? 'application/json',
      'Cache-Control': 'no-store',
      ...(response.headers.get('Content-Disposition') ? { 'Content-Disposition': response.headers.get('Content-Disposition')! } : {}),
    } });
  } catch {
    return NextResponse.json({ success: false, error: { message: 'No se pudo conectar con el servidor' } }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
