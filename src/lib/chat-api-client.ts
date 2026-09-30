import type { ApiResponse } from '@/types/api';

const CHAT_TIMEOUT = 60000;

async function request<T>(path: string, method: 'POST' | 'DELETE', body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHAT_TIMEOUT);

  try {
    const response = await fetch(`/api/chat${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    const payload = (await response.json()) as ApiResponse<T>;
    if (!response.ok || !payload.success) {
      throw new Error(payload.error?.message || 'No se pudo completar la consulta');
    }
    return payload.data as T;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('La consulta tardó demasiado. Intentá nuevamente.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export const chatApiClient = {
  sendMessage: (message: string, conversationId: string) =>
    request<{ response: string }>('/message', 'POST', { message, conversationId }),
  clearConversation: (conversationId: string) =>
    request<{ cleared: boolean }>(`/messages/${encodeURIComponent(conversationId)}`, 'DELETE'),
};
