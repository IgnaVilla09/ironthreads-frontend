import { cookies } from 'next/headers';
import { AuthSession } from '@/types/auth';

const BACKEND_API_BASE = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const APP_SESSION_COOKIE = 'iron_session';

type BackendEnvelope<T> = {
  success: boolean;
  data?: T;
};

export async function getCurrentSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(APP_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const response = await fetch(`${BACKEND_API_BASE}/api/v1/auth/session`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as BackendEnvelope<AuthSession>;
    return payload.data ?? null;
  } catch {
    return null;
  }
}

export function getBackendApiBase() {
  return BACKEND_API_BASE;
}
