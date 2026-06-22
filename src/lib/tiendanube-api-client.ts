import { AbandonedCheckout, HealthResponse, MessageLog } from '@/types/tiendanube';

const API_BASE = '/api/tiendanube';
const REQUEST_TIMEOUT = 20000;
const HEALTH_MAX_WAIT = 45000;

type RequestConfig = {
  method?: 'GET' | 'POST';
  body?: unknown;
  params?: Record<string, string | number | undefined>;
};

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
};

export class TiendaNubeApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'TiendaNubeApiError';
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl(endpoint: string, params?: Record<string, string | number | undefined>) {
  if (!API_BASE.startsWith('http')) {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.set(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    return `${API_BASE}${endpoint}${query ? `?${query}` : ''}`;
  }

  const url = new URL(endpoint, API_BASE);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

function normalizeResponse<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data as T;
  }

  return payload as T;
}

function defaultMessage(status?: number) {
  switch (status) {
    case 401:
      return 'Debes iniciar sesión para continuar.';
    case 404:
      return 'El recurso solicitado no existe.';
    case 429:
      return 'La API rechazo la solicitud por demasiadas requests.';
    case 500:
      return 'La API devolvio un error interno.';
    case 503:
      return 'La API no esta disponible en este momento.';
    default:
      return 'No se pudo completar la solicitud a Tienda Nube.';
  }
}

async function request<T>(endpoint: string, config: RequestConfig = {}) {
  const { method = 'GET', body, params } = config;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(buildUrl(endpoint, params), {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: 'no-store',
    });

    const rawText = await response.text();
    let payload: unknown = null;

    if (rawText) {
      try {
        payload = JSON.parse(rawText) as unknown;
      } catch {
        payload = rawText;
      }
    }

    if (!response.ok) {
      const apiMessage =
        payload && typeof payload === 'object' && 'error' in payload
          ? ((payload as ApiEnvelope<unknown>).error?.message ?? null)
          : null;

      throw new TiendaNubeApiError(
        apiMessage || defaultMessage(response.status),
        response.status,
        payload && typeof payload === 'object' && 'error' in payload
          ? (payload as ApiEnvelope<unknown>).error?.code
          : undefined
      );
    }

    return normalizeResponse<T>(payload);
  } catch (error) {
    if (error instanceof TiendaNubeApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new TiendaNubeApiError('La API tardó demasiado en responder.');
    }

    throw new TiendaNubeApiError('No se pudo conectar con la API. Revisa CORS, red o disponibilidad del backend.');
  } finally {
    clearTimeout(timeoutId);
  }
}

export const tiendaNubeApiClient = {
  baseUrl: API_BASE,
  getHealth: async () => {
    let lastError: unknown;
    const startedAt = Date.now();
    let attempt = 0;

    while (Date.now() - startedAt < HEALTH_MAX_WAIT) {
      try {
        return await request<HealthResponse>('/health');
      } catch (error) {
        lastError = error;
        attempt += 1;

        const isRetriable =
          error instanceof TiendaNubeApiError &&
          (error.status === 502 || error.status === 503 || error.status === 504 || error.status === undefined);

        if (!isRetriable) {
          throw error;
        }

        const elapsed = Date.now() - startedAt;
        const remaining = HEALTH_MAX_WAIT - elapsed;

        if (remaining <= 0) {
          break;
        }

        await delay(Math.min(5000, Math.max(1500, 1500 * attempt), remaining));
      }
    }

    throw lastError;
  },
  getCheckouts: () => request<AbandonedCheckout[]>('/checkouts'),
  getMessageLogs: () => request<MessageLog[]>('/message-logs'),
};
