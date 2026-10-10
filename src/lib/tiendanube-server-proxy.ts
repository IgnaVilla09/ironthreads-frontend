import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { APP_SESSION_COOKIE, getBackendApiBase } from '@/lib/server-auth';

export async function proxyTiendaNube(path: string, init: { method?: 'GET' | 'POST'; body?: unknown } = {}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(APP_SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return NextResponse.json({ success: false, error: { code: 'AUTH_REQUIRED', message: 'No autenticado' } }, { status: 401 });
  }
  const response = await fetch(`${getBackendApiBase()}/api/v1/tiendanube${path}`, {
    method: init.method ?? 'GET',
    headers: { Authorization: `Bearer ${sessionToken}`, ...(init.body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: 'no-store',
  });
  const payload = await response.json();
  return NextResponse.json(payload, { status: response.status });
}
