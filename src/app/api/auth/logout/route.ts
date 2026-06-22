import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { APP_SESSION_COOKIE, getBackendApiBase } from '@/lib/server-auth';

export async function POST() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(APP_SESSION_COOKIE)?.value;

  if (sessionToken) {
    await fetch(`${getBackendApiBase()}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
      cache: 'no-store',
    }).catch(() => null);
  }

  cookieStore.delete(APP_SESSION_COOKIE);
  return NextResponse.json({ success: true, data: { ok: true } });
}
