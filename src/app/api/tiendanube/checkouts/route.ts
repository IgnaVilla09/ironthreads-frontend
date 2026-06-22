import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { APP_SESSION_COOKIE, getBackendApiBase } from '@/lib/server-auth';

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(APP_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return NextResponse.json({ success: false, error: { code: 'AUTH_REQUIRED', message: 'No autenticado' } }, { status: 401 });
  }

  const response = await fetch(`${getBackendApiBase()}/api/v1/tiendanube/checkouts`, {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
    cache: 'no-store',
  });

  const payload = await response.json();
  return NextResponse.json(payload, { status: response.status });
}
