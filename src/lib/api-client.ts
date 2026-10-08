import { ApiResponse } from '@/types/api';

const API_BASE = '/api/backend';
const REQUEST_TIMEOUT = 15000;

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestConfig {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
}

async function request<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, params } = config;

    let url = `${API_BASE}${endpoint.replace(/^\/api\/v1/, '')}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.set(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (res.status === 204) {
      return {} as ApiResponse<T>;
    }

    const json: ApiResponse<T> = await res.json();

    if (!res.ok) {
      throw new ApiError(
        json.error?.message || 'Error al conectar con el servidor',
        res.status,
        json.error?.code
      );
    }

    return json;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('La solicitud tardó demasiado. Intenta de nuevo.');
    }
    throw new ApiError('Error de conexión. Verifica tu conexión a internet.');
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, string | number | undefined>) =>
    request<T>(endpoint, { params }),

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body }),

  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PUT', body }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
