import { proxyChatRequest } from '@/lib/chat-proxy';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  return proxyChatRequest('DELETE', `/messages/${encodeURIComponent(conversationId)}`);
}
