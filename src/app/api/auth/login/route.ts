import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { APP_SESSION_COOKIE, getBackendApiBase } from '@/lib/server-auth';

const SESSION_MAX_AGE = 60 * 60 * 24 * 3;

export async function POST(request: NextRequest) {
  const body = await request.json();

  const response = await fetch(`${getBackendApiBase()}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const payload = await response.json();

  if (!response.ok) {
    return NextResponse.json(payload, { status: response.status });
  }

  const cookieStore = await cookies();
  cookieStore.set(APP_SESSION_COOKIE, payload.data.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  return NextResponse.json({
    success: true,
    data: {
      user: payload.data.user,
      expiresAt: payload.data.expiresAt,
    },
  });
}
