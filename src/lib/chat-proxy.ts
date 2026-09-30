import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { APP_SESSION_COOKIE, getBackendApiBase } from '@/lib/server-auth';

export async function proxyChatRequest(method: 'POST' | 'DELETE', path: string, body?: string) {
  const sessionToken = (await cookies()).get(APP_SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_REQUIRED', message: 'No autenticado' } },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${getBackendApiBase()}/api/v1/chat${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body,
      cache: 'no-store',
    });

    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UPSTREAM_ERROR', message: 'No se pudo conectar con el servidor' } },
      { status: 502 }
    );
  }
}
